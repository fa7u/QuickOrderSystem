import fs from "fs";
import path from "path";
import { doc, getDoc } from "firebase/firestore";

/**
 * Dynamically generates a custom PWA Manifest JSON response
 * based on the incoming request parameters (query, cookies, referer)
 * and fetches the selected store custom name and logo from Firestore.
 */
export async function generateManifest(req, res, db) {
  // Set cache headers to strictly forbid caching of the web manifest so it updates instantly
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  let orgId = req.query.orgId || "";
  let view = req.query.view || "";

  // Parse cookies manually for maximum reliability of PWA storage parameters
  const cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      if (parts.length >= 2) {
        const name = parts[0].trim();
        cookies[name] = decodeURIComponent(parts.slice(1).join("=").trim());
      }
    });
  }

  if (!orgId) orgId = cookies["quickorder_last_org_id"] || "";
  if (!view) view = cookies["quickorder_last_view"] || "customer";

  // Fallback: Parse query parameters from the referer header if query empty
  if (!orgId && req.headers.referer) {
    try {
      const refererUrl = new URL(req.headers.referer);
      orgId = refererUrl.searchParams.get("orgId") || "";
      view = refererUrl.searchParams.get("view") || view;
    } catch (err) {
      console.warn("Failed to parse referer in PWA dynamic manifest generator:", err);
    }
  }

  if (view === "superadmin" || view === "proposal") {
    orgId = "";
  }

  // Base manifest fallback template
  const baseManifestPath = path.join(process.cwd(), "public", "manifest.json");
  let manifest = {
    short_name: "الطلب السريع",
    name: "نظام الطلبات السريعة المتطور",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    start_url: "/",
    background_color: "#020617",
    theme_color: "#020617",
    display: "standalone",
    orientation: "portrait"
  };

  // Read base manifest if it exists
  if (fs.existsSync(baseManifestPath)) {
    try {
      const manifestStr = fs.readFileSync(baseManifestPath, "utf-8");
      manifest = JSON.parse(manifestStr);
    } catch (e) {
      console.warn("Error reading /public/manifest.json, using default template:", e);
    }
  }

  // Preserve context by attaching the active query parameters to start_url
  if (orgId || view) {
    const queryParams = [];
    if (orgId) queryParams.push(`orgId=${orgId}`);
    if (view) queryParams.push(`view=${view}`);
    manifest.start_url = `/?${queryParams.join("&")}`;
  }

  // Fetch organization settings from Firestore if DB is online and orgId matches
  if (orgId && db) {
    try {
      const orgDocRef = doc(db, "organizations", orgId);
      const orgDocSnap = await getDoc(orgDocRef);
      let displayName = "";
      let subscriptionTier = "tier1";

      if (orgDocSnap.exists()) {
        const oData = orgDocSnap.data();
        if (oData) {
          if (oData.name) {
            displayName = oData.name;
          }
          subscriptionTier = oData.subscriptionTier || oData.subscriptionPlan || "tier1";
        }
      }

      // Check settings/branding document specifically
      const brandingDocRef = doc(db, "organizations", orgId, "settings", "branding");
      const brandingDocSnap = await getDoc(brandingDocRef);
      let logoUrl = "";

      if (brandingDocSnap.exists()) {
        const bData = brandingDocSnap.data();
        if (bData) {
          displayName = bData.restaurantName || displayName || "الطلب السريع";
          logoUrl = bData.logoUrl || "";
        }
      }

      // Enforce white-label gating: Tier 1 always falls back to generic brand
      if (subscriptionTier === "tier1") {
        displayName = "الطلب السريع";
      }

      if (!displayName) {
        displayName = "الطلب السريع";
      }

      // Append suffix according to user current interface view
      let suffix = "";
      if (view === "staff") {
        suffix = " (موظفين)";
      } else if (view === "admin") {
        suffix = " (إدارة)";
      } else {
        // For customer view (or empty): Only add suffix on Tier 1. 
        // Tier 2 and Tier 3 should show the pure custom store name on the home screen.
        if (subscriptionTier === "tier1") {
          suffix = " (عملاء)";
        }
      }

      const formattedName = suffix ? `${displayName}${suffix}` : displayName;
      manifest.name = formattedName;
      manifest.short_name = formattedName;

      if (logoUrl) {
        manifest.icons = [
          {
            src: logoUrl,
            type: "image/png",
            sizes: "512x512"
          },
          {
            src: logoUrl,
            type: "image/png",
            sizes: "192x192",
            purpose: "any maskable"
          }
        ];
        console.log(`[Dynamic PWA] Successfully set manifest for ${orgId}: "${formattedName}" with logo ${logoUrl}`);
      } else {
        console.log(`[Dynamic PWA] Successfully set manifest for ${orgId}: "${formattedName}" with default logo`);
      }
    } catch (dbErr) {
      console.error("[Dynamic PWA DB Query failed, falling back]:", dbErr);
    }
  }

  return res.json(manifest);
}

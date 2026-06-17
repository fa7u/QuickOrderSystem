import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import webpush from "web-push";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where } from "firebase/firestore";
import { generateManifest } from "./manifest.js";

// Read Firebase Applet Configuration
import firebaseConfigRaw from "./firebase-applet-config.json";
const firebaseConfig = (firebaseConfigRaw as any).default || firebaseConfigRaw;

let db: any = null;

try {
  if (firebaseConfig && firebaseConfig.apiKey) {
    const app = initializeApp(firebaseConfig);
    const dbId = firebaseConfig.firestoreDatabaseId || firebaseConfig.databaseId;
    if (dbId) {
      db = getFirestore(app, dbId);
    } else {
      db = getFirestore(app);
    }
    console.log("Firebase initialized successfully on server.");
  } else {
    console.warn("No Firebase configuration found on server.");
  }
} catch (e) {
  console.error("Firebase init failed on server:", e);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware to auto-capture orgId and view from incoming query parameters and save them as cookies
  app.use((req, res, next) => {
    const orgId = req.query.orgId as string;
    const view = req.query.view as string;
    if (orgId) {
      res.cookie("quickorder_last_org_id", orgId, { maxAge: 31536000 * 1000, httpOnly: false, sameSite: "lax" });
    }
    if (view) {
      res.cookie("quickorder_last_view", view, { maxAge: 31536000 * 1000, httpOnly: false, sameSite: "lax" });
    }
    next();
  });

  // Setup VAPID details for Web Push
  let vapidKeys: { publicKey: string; privateKey: string } | null = null;
  if (db) {
    try {
      const vapidDocRef = doc(db, "organizations", "systemKeys", "settings", "vapid");
      const vapidSnap = await getDoc(vapidDocRef);
      if (vapidSnap.exists()) {
        const data = vapidSnap.data();
        if (data.publicKey && data.privateKey) {
          vapidKeys = { publicKey: data.publicKey, privateKey: data.privateKey };
          console.log("Loaded system VAPID keys from Firestore.");
        }
      }
      
      if (!vapidKeys) {
        // Generate new VAPID keys and save to Firestore system keys doc
        const generated = webpush.generateVAPIDKeys();
        vapidKeys = { publicKey: generated.publicKey, privateKey: generated.privateKey };
        await setDoc(vapidDocRef, {
          publicKey: generated.publicKey,
          privateKey: generated.privateKey,
          createdAt: new Date().toISOString()
        });
        console.log("Generated and stored new system VAPID keys in Firestore.");
      }

      if (vapidKeys) {
        webpush.setVapidDetails(
          "mailto:support@quickorder.com",
          vapidKeys.publicKey,
          vapidKeys.privateKey
        );
      }
    } catch (err) {
      console.error("Failed to setup VAPID keys:", err);
    }
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Simple endpoint to check if user has valid admin session (basic)
  app.post("/api/admin/auth", (req, res) => {
    const { secret } = req.body;
    if (secret === process.env.ADMIN_SECRET) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false });
    }
  });

  // Public endpoint to request public VAPID key
  app.get("/api/vapid-public-key", (req, res) => {
    if (vapidKeys) {
      res.json({ publicKey: vapidKeys.publicKey });
    } else {
      res.status(500).json({ error: "VAPID configuration not set up" });
    }
  });

  // Register or update push subscription
  app.post("/api/push-subscribe", async (req, res) => {
    const { orgId, userType, orderId, staffId, subscription } = req.body;
    if (!db) {
      return res.status(500).json({ error: "Firebase not configured on server" });
    }
    if (!orgId || !userType || !subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Missing required parameters in push-subscribe" });
    }

    try {
      // Create a deterministic unique ID based on subscription endpoint string to avoid duplicates
      const safeId = "sub_" + Buffer.from(subscription.endpoint).toString("hex").slice(-28);
      const subDocRef = doc(db, "organizations", orgId, "settings", safeId);
      
      const payload: any = {
        type: "push_subscription",
        userType,
        subscription,
        updatedAt: new Date().toISOString(),
      };

      if (orderId) payload.orderId = orderId;
      if (staffId) payload.staffId = staffId;

      await setDoc(subDocRef, payload, { merge: true });
      res.json({ success: true, subId: safeId });
    } catch (err: any) {
      console.error("Subscription save failed:", err);
      res.status(500).json({ error: err.message || "Unknown error" });
    }
  });

  // Trigger push notifications for new orders
  app.post("/api/notify-new-order", async (req, res) => {
    const { orgId, orderId, customerName, items, restaurantName } = req.body;
    if (!db) return res.status(500).json({ error: "Firestore not ready" });

    try {
      // Query settings subcollection where type is "push_subscription"
      // Filter for managers, admins, or staff
      const settingsRef = collection(db, "organizations", orgId, "settings");
      const subsSnap = await getDocs(settingsRef);
      
      const payload = JSON.stringify({
        title: `🛍️ طلب جديد - ${restaurantName || "الطلبات"}`,
        body: `وصلك طلب جديد من: ${customerName || "عميل"}\nالمحتويات: ${items ? items.substring(0, 50) : ""}...`,
        tag: `new-order-${orgId}`,
        data: {
          url: `/?orgId=${orgId}&view=staff`
        }
      });

      let sentCount = 0;
      for (const d of subsSnap.docs) {
        const sData = d.data();
        if (sData.type === "push_subscription" && (sData.userType === "staff" || sData.userType === "admin")) {
          try {
            await webpush.sendNotification(sData.subscription, payload, {
              TTL: 86400,
              headers: {
                "urgency": "high",
                "apns-priority": "10",
                "apns-push-type": "alert"
              }
            });
            sentCount++;
          } catch (pushErr: any) {
            console.warn("Failed sending new order push", pushErr.statusCode);
            if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
              await deleteDoc(doc(db, "organizations", orgId, "settings", d.id));
            }
          }
        }
      }

      res.json({ success: true, sentCount });
    } catch (err: any) {
      console.error("Notify new order error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Trigger push notifications for order status changes
  app.post("/api/notify-order-status", async (req, res) => {
    const { orgId, orderId, newStatus, statusBody, restaurantName } = req.body;
    if (!db) return res.status(500).json({ error: "Firestore not ready" });

    try {
      const settingsRef = collection(db, "organizations", orgId, "settings");
      const subsSnap = await getDocs(settingsRef);

      const payload = JSON.stringify({
        title: `🔔 تحديث حالة طلبك - ${restaurantName || "بوابة الطلب"}`,
        body: statusBody || `تغيرت حالة طلبك إلى: ${newStatus}`,
        tag: `order-${orderId}`,
        data: {
          url: `/?orgId=${orgId}&orderId=${orderId}`
        }
      });

      let sentCount = 0;
      for (const d of subsSnap.docs) {
        const sData = d.data();
        if (sData.type === "push_subscription" && sData.userType === "customer" && sData.orderId === orderId) {
          try {
            await webpush.sendNotification(sData.subscription, payload, {
              TTL: 86400,
              headers: {
                "urgency": "high",
                "apns-priority": "10",
                "apns-push-type": "alert"
              }
            });
            sentCount++;
          } catch (pushErr: any) {
            console.warn("Failed sending status change push", pushErr.statusCode);
            if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
              await deleteDoc(doc(db, "organizations", orgId, "settings", d.id));
            }
          }
        }
      }

      res.json({ success: true, sentCount });
    } catch (err: any) {
      console.error("Notify status error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Trigger push notifications for chat events
  app.post("/api/notify-new-chat", async (req, res) => {
    const { orgId, orderId, sender, senderName, text, restaurantName } = req.body;
    if (!db) return res.status(500).json({ error: "Firestore not ready" });

    try {
      const settingsRef = collection(db, "organizations", orgId, "settings");
      const subsSnap = await getDocs(settingsRef);

      let sentCount = 0;

      if (sender === "customer") {
        // Send to staff and admins
        const payload = JSON.stringify({
          title: `💬 رسالة من العميل - ${senderName || "تحديث الطلب"}`,
          body: text || "",
          tag: `chat-${orderId}`,
          data: {
            url: `/?orgId=${orgId}&view=staff`
          }
        });

        for (const d of subsSnap.docs) {
          const sData = d.data();
          if (sData.type === "push_subscription" && (sData.userType === "staff" || sData.userType === "admin")) {
            try {
              await webpush.sendNotification(sData.subscription, payload, {
                TTL: 86400,
                headers: {
                  "urgency": "high",
                  "apns-priority": "10",
                  "apns-push-type": "alert"
                }
              });
              sentCount++;
            } catch (pushErr: any) {
              console.warn("Failed sending chat push to staff", pushErr.statusCode);
              if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                await deleteDoc(doc(db, "organizations", orgId, "settings", d.id));
              }
            }
          }
        }
      } else {
        // Send to customer of this order
        const payload = JSON.stringify({
          title: `💬 رسالة جديدة - ${restaurantName || "المتجر"}`,
          body: text || "",
          tag: `chat-${orderId}`,
          data: {
            url: `/?orgId=${orgId}&orderId=${orderId}`
          }
        });

        for (const d of subsSnap.docs) {
          const sData = d.data();
          if (sData.type === "push_subscription" && sData.userType === "customer" && sData.orderId === orderId) {
            try {
              await webpush.sendNotification(sData.subscription, payload, {
                TTL: 86400,
                headers: {
                  "urgency": "high",
                  "apns-priority": "10",
                  "apns-push-type": "alert"
                }
              });
              sentCount++;
            } catch (pushErr: any) {
              console.warn("Failed sending chat push to customer", pushErr.statusCode);
              if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                await deleteDoc(doc(db, "organizations", orgId, "settings", d.id));
              }
            }
          }
        }
      }

      res.json({ success: true, sentCount });
    } catch (err: any) {
      console.error("Notify chat error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Dynamic manifest.json supporting start_url preservation
  app.get("/manifest.json", async (req, res) => {
    try {
      await generateManifest(req, res, db);
    } catch (err) {
      console.error("Error running server-side generateManifest:", err);
      res.status(500).json({ error: "Failed to generate dynamic PWA manifest" });
    }
  });

  // Explicit, no-cache sw.js route to ensure fast updates and reliable background push delivery
  app.get("/sw.js", (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    
    const prodPath = path.join(process.cwd(), "dist", "sw.js");
    const devPath = path.join(process.cwd(), "public", "sw.js");
    
    if (process.env.NODE_ENV === "production" && fs.existsSync(prodPath)) {
      res.sendFile(prodPath);
    } else if (fs.existsSync(devPath)) {
      res.sendFile(devPath);
    } else {
      res.status(404).send("sw.js not found");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    // Dynamic HTML interceptor in dev mode
    app.get(["/", "/index.html"], async (req, res, next) => {
      let orgId = req.query.orgId as string;
      let view = req.query.view as string || "customer";

      // Parse cookie parameters if absent in query
      const cookies: Record<string, string> = {};
      if (req.headers.cookie) {
        req.headers.cookie.split(";").forEach((cookie) => {
          const parts = cookie.split("=");
          if (parts.length >= 2) {
            const name = parts[0].trim();
            cookies[name] = decodeURIComponent(parts.slice(1).join("=").trim());
          }
        });
      }

      if (!orgId) orgId = cookies["quickorder_last_org_id"];
      if (!view) view = cookies["quickorder_last_view"] || "customer";

      // Dynamically preserve state by setting updated HTTP cookies instantly
      if (req.query.orgId) {
        res.cookie("quickorder_last_org_id", req.query.orgId, { maxAge: 31536000000, path: "/", sameSite: "lax" });
      }
      if (req.query.view) {
        res.cookie("quickorder_last_view", req.query.view, { maxAge: 31536000000, path: "/", sameSite: "lax" });
      }

      const indexPath = path.join(process.cwd(), "index.html");
      if (!fs.existsSync(indexPath)) {
        return next();
      }

      try {
        let rawHtml = fs.readFileSync(indexPath, "utf-8");
        // Run Vite HTML transform
        let html = await vite.transformIndexHtml(req.url, rawHtml);

        const manifestUrl = orgId 
          ? `/manifest.json?orgId=${encodeURIComponent(orgId)}&view=${encodeURIComponent(view)}`
          : "/manifest.json";

        // Inject the exact dynamic manifest URL
        html = html.replace(
          /<link id="pwa-manifest" rel="manifest" href="[^"]*"\s*\/?>/i,
          `<link id="pwa-manifest" rel="manifest" href="${manifestUrl}" />`
        );

        // Fetch custom branding for all tiers
        let displayName = "الطلب السريع";
        let logoUrl = "/logo.png";

        if (orgId && db) {
          try {
            const orgDocRef = doc(db, "organizations", orgId);
            const orgDocSnap = await getDoc(orgDocRef);
            if (orgDocSnap.exists()) {
              const oData = orgDocSnap.data();
              if (oData) {
                displayName = oData.name || "الطلب السريع";
              }
            }

            const brandingDocRef = doc(db, "organizations", orgId, "settings", "branding");
            const brandingDocSnap = await getDoc(brandingDocRef);
            if (brandingDocSnap.exists()) {
              const bData = brandingDocSnap.data();
              if (bData) {
                displayName = bData.restaurantName || displayName;
                logoUrl = bData.logoUrl || "/logo.png";
              }
            }
          } catch (dbErr) {
            console.error("Failed to query branding in server-side HTML generation (dev):", dbErr);
          }
        }

        let formattedName = displayName;
        if (view === "customer") {
          formattedName = `${displayName} (عملاء)`;
        } else if (view === "staff") {
          formattedName = `${displayName} (موظفين)`;
        } else if (view === "admin") {
          formattedName = `${displayName} (إدارة)`;
        }

        // Dynamically replace PWA installation displays and iOS titles
        html = html.replace(/<title>[^<]*<\/title>/gi, `<title>${formattedName}</title>`);
        html = html.replace(/<meta name="apple-mobile-web-app-title" content="[^"]*"\s*\/?>/gi, `<meta name="apple-mobile-web-app-title" content="${formattedName}" />`);
        html = html.replace(/<meta name="application-name" content="[^"]*"\s*\/?>/gi, `<meta name="application-name" content="${formattedName}" />`);

        // Dynamically replace all icon variants (apple touch, icons, shortcuts) helper
        if (logoUrl && logoUrl !== "/logo.png") {
          html = html.replace(/<link rel="apple-touch-icon"[^>]*href="[^"]*"[^>]*>/gi, `<link rel="apple-touch-icon" href="${logoUrl}" />`);
          html = html.replace(/<link rel="icon"[^>]*href="[^"]*"[^>]*>/gi, `<link rel="icon" type="image/png" href="${logoUrl}" />`);
          html = html.replace(/<link rel="shortcut icon"[^>]*href="[^"]*"[^>]*>/gi, `<link rel="shortcut icon" type="image/png" href="${logoUrl}" />`);
        }

        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (err) {
        next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      // Dynamic HTML interceptor in production mode (MUST run BEFORE express.static)
      app.get(["/", "/index.html"], async (req, res) => {
        let orgId = req.query.orgId as string;
        let view = req.query.view as string || "customer";

        const cookies: Record<string, string> = {};
        if (req.headers.cookie) {
          req.headers.cookie.split(";").forEach((cookie) => {
            const parts = cookie.split("=");
            if (parts.length >= 2) {
              const name = parts[0].trim();
              cookies[name] = decodeURIComponent(parts.slice(1).join("=").trim());
            }
          });
        }

        if (!orgId) orgId = cookies["quickorder_last_org_id"];
        if (!view) view = cookies["quickorder_last_view"] || "customer";

        // Dynamically preserve state by setting updated HTTP cookies instantly
        if (req.query.orgId) {
          res.cookie("quickorder_last_org_id", req.query.orgId, { maxAge: 31536000000, path: "/", sameSite: "lax" });
        }
        if (req.query.view) {
          res.cookie("quickorder_last_view", req.query.view, { maxAge: 31536000000, path: "/", sameSite: "lax" });
        }

        const indexPath = path.join(distPath, "index.html");
        if (!fs.existsSync(indexPath)) {
          return res.status(404).send("index.html not found");
        }

        try {
          let html = fs.readFileSync(indexPath, "utf-8");

          const manifestUrl = orgId 
            ? `/manifest.json?orgId=${encodeURIComponent(orgId)}&view=${encodeURIComponent(view)}`
            : "/manifest.json";

          // Inject the exact dynamic manifest URL
          html = html.replace(
            /<link id="pwa-manifest" rel="manifest" href="[^"]*"\s*\/?>/i,
            `<link id="pwa-manifest" rel="manifest" href="${manifestUrl}" />`
          );

          // Fetch custom branding for all tiers
          let displayName = "الطلب السريع";
          let logoUrl = "/logo.png";

          if (orgId && db) {
            try {
              const orgDocRef = doc(db, "organizations", orgId);
              const orgDocSnap = await getDoc(orgDocRef);
              if (orgDocSnap.exists()) {
                const oData = orgDocSnap.data();
                if (oData) {
                  displayName = oData.name || "الطلب السريع";
                }
              }

              const brandingDocRef = doc(db, "organizations", orgId, "settings", "branding");
              const brandingDocSnap = await getDoc(brandingDocRef);
              if (brandingDocSnap.exists()) {
                const bData = brandingDocSnap.data();
                if (bData) {
                  displayName = bData.restaurantName || displayName;
                  logoUrl = bData.logoUrl || "/logo.png";
                }
              }
            } catch (dbErr) {
              console.error("Failed to query branding in server-side HTML generation (prod):", dbErr);
            }
          }

          let formattedName = displayName;
          if (view === "customer") {
            formattedName = `${displayName} (عملاء)`;
          } else if (view === "staff") {
            formattedName = `${displayName} (موظفين)`;
          } else if (view === "admin") {
            formattedName = `${displayName} (إدارة)`;
          }

          // Dynamically replace PWA installation displays and iOS titles
          html = html.replace(/<title>[^<]*<\/title>/gi, `<title>${formattedName}</title>`);
          html = html.replace(/<meta name="apple-mobile-web-app-title" content="[^"]*"\s*\/?>/gi, `<meta name="apple-mobile-web-app-title" content="${formattedName}" />`);
          html = html.replace(/<meta name="application-name" content="[^"]*"\s*\/?>/gi, `<meta name="application-name" content="${formattedName}" />`);

          // Dynamically replace all icon variants (apple touch, icons, shortcuts) helper
          if (logoUrl && logoUrl !== "/logo.png") {
            html = html.replace(/<link rel="apple-touch-icon"[^>]*href="[^"]*"[^>]*>/gi, `<link rel="apple-touch-icon" href="${logoUrl}" />`);
            html = html.replace(/<link rel="icon"[^>]*href="[^"]*"[^>]*>/gi, `<link rel="icon" type="image/png" href="${logoUrl}" />`);
            html = html.replace(/<link rel="shortcut icon"[^>]*href="[^"]*"[^>]*>/gi, `<link rel="shortcut icon" type="image/png" href="${logoUrl}" />`);
          }

          res.status(200).set({ "Content-Type": "text/html" }).end(html);
        } catch (err) {
          console.error("Error tailoring index.html:", err);
          res.sendFile(indexPath);
        }
      });

      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

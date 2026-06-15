// Push Subscription helper utilities for background push notifications

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush(params: {
  orgId: string;
  userType: "customer" | "staff" | "admin";
  orderId?: string;
  staffId?: string;
}) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications are not supported in this browser.");
    return null;
  }

  try {
    // 1. Ensure Service Worker is registered and active
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      console.warn("No active Service worker found.");
      return null;
    }

    // 2. Fetch public VAPID key from the backend
    const keyRes = await fetch("/api/vapid-public-key");
    if (!keyRes.ok) {
      throw new Error(`Failed to fetch VAPID public key: ${keyRes.statusText}`);
    }
    const { publicKey } = await keyRes.json();
    if (!publicKey) {
      throw new Error("No public VAPID key returned from server");
    }

    // 3. Request user's permission if not already granted
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.warn("Notification permission was denied.");
      return null;
    }

    // 4. Subscribe the user via PushManager
    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    });

    console.log("Push registered successfully:", subscription);

    // 5. Send subscription to our server
    const apiRes = await fetch("/api/push-subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        orgId: params.orgId,
        userType: params.userType,
        orderId: params.orderId,
        staffId: params.staffId,
        subscription: subscription.toJSON()
      })
    });

    if (!apiRes.ok) {
      throw new Error(`Failed to register server subscription: ${apiRes.statusText}`);
    }

    const result = await apiRes.json();
    return result;
  } catch (err) {
    console.error("Error setting up push subscription:", err);
    return null;
  }
}

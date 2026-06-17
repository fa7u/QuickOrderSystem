// Service Worker for Fast Order Tracking Push Alerts & Messaging Notifications

// Import Firebase App and Messaging compatibility libraries inside Service Worker
try {
  importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

  // Firebase Configuration corresponding to project settings
  const firebaseConfig = {
    apiKey: "AIzaSyAGpBGEN9jyRrUvGvn5s48W-UOoCAuluFA",
    authDomain: "quickorder-b5367.firebaseapp.com",
    projectId: "quickorder-b5367",
    storageBucket: "quickorder-b5367.firebasestorage.app",
    messagingSenderId: "527507068443",
    appId: "1:527507068443:web:d2a309ee238020c9ca4abe"
  };

  // Initialize Firebase app inside the Service Worker context
  if (firebase && firebase.initializeApp) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Listen to background messages sent via Firebase Cloud Messaging (FCM)
    messaging.onBackgroundMessage((payload) => {
      console.log("FCM Background message received:", payload);
      const title = payload.notification?.title || payload.data?.title || "تنبيه جديد 🔔";
      const body = payload.notification?.body || payload.data?.body || "لديك تحديث جديد في طلبك.";
      const tag = payload.notification?.tag || payload.data?.tag || payload.collapseKey || "fcm-update";
      const icon = payload.notification?.icon || payload.data?.icon || "/logo.png";
      const clickUrl = payload.data?.url || "/";

      let resolvedIcon = icon;
      try {
        if (resolvedIcon && !resolvedIcon.startsWith("http")) {
          resolvedIcon = new URL(resolvedIcon, self.location.origin).href;
        }
      } catch (urlErr) {
        resolvedIcon = "/logo.png";
      }

      const options = {
        body,
        icon: resolvedIcon,
        vibrate: [200, 100, 200],
        tag,
        requireInteraction: true,
        data: payload.data || { url: clickUrl }
      };

      self.registration.showNotification(title, options);
    });
  }
} catch (err) {
  console.error("Failed to initialize Firebase Cloud Messaging in Service Worker:", err);
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Listener for background actions or messages
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, icon, tag, data } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body || "",
        icon: icon || "/logo.png",
        vibrate: [200, 100, 200],
        tag: tag || "chat-notif",
        requireInteraction: true,
        data: data || {
          url: self.registration.scope
        }
      })
    );
  }
});

// Listener for Server Push Notifications (triggers even if app is fully closed!)
self.addEventListener("push", (event) => {
  console.log("Push event received in Service Worker!", event);
  let title = "تحديث جديد للطلب 🔔";
  let body = "لديك تحديث جديد في طلبك.";
  let tag = "order-update";
  let icon = "/logo.png";
  let data = { url: "/" };

  try {
    if (event.data) {
      const rawText = event.data.text();
      try {
        const payload = JSON.parse(rawText);
        title = payload.title || title;
        body = payload.body || body;
        tag = payload.tag || tag;
        icon = payload.icon || icon;
        if (payload.data) {
          data = payload.data;
        }
      } catch (jsonErr) {
        // Fallback to raw text if not JSON
        body = rawText || body;
      }
    }
  } catch (err) {
    console.error("Failed to parse event data inside sw:", err);
  }

  // Robustly resolve the icon URL to absolute format so iOS/Android platform handles it in background
  let resolvedIcon = icon;
  try {
    if (resolvedIcon && !resolvedIcon.startsWith("http")) {
      resolvedIcon = new URL(resolvedIcon, self.location.origin).href;
    }
  } catch (urlErr) {
    resolvedIcon = "/logo.png";
  }

  const options = {
    body: body,
    icon: resolvedIcon,
    vibrate: [200, 100, 200],
    tag: tag,
    requireInteraction: true,
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
      .catch((err) => {
        console.error("Critical error rendering background notification:", err);
      })
  );
});

// Handle clicking on notifications
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const notificationData = event.notification.data || {};
  const relativeUrl = notificationData.url || "/";
  const targetUrl = new URL(relativeUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Find a client with a matching URL
      for (const client of clientList) {
        if ("focus" in client) {
          if (client.url && (client.url === targetUrl || client.url.includes(new URL(targetUrl, self.location.origin).pathname))) {
            return client.focus();
          }
        }
      }
      // If no matching client, open a new window with absolute URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

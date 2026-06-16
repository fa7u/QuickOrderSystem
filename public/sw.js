// Service Worker for Fast Order Tracking Push Alerts & Messaging Notifications
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
  console.log("Push event received!", event);
  let title = "تحديث جديد للطلب 🔔";
  let body = "لديك تحديث جديد في طلبك.";
  let tag = "order-update";
  let icon = "/logo.png";
  let data = { url: "/" };

  if (event.data) {
    try {
      const payload = event.data.json();
      title = payload.title || title;
      body = payload.body || body;
      tag = payload.tag || tag;
      icon = payload.icon || icon;
      if (payload.data) {
        data = payload.data;
      }
    } catch (e) {
      // Treat fallback as plain text if failed to parse JSON
      body = event.data.text() || body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      vibrate: [200, 100, 200],
      tag: tag,
      requireInteraction: true,
      data: data
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

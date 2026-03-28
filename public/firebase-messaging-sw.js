/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCuIZCRyyMPDQX5PtZI3zmyJfjsIkCkX1o",
  authDomain: "media-a7499.firebaseapp.com",
  projectId: "media-a7499",
  storageBucket: "media-a7499.firebasestorage.app",
  messagingSenderId: "1025937182778",
  appId: "1:1025937182778:web:7abe1d772da3889e57e503",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message:", payload);

  const title = payload.notification?.title || "Infoslight.cd";
  const options = {
    body: payload.notification?.body || "Nouvelle actualité disponible",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    data: payload.data,
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow("/");
    })
  );
});

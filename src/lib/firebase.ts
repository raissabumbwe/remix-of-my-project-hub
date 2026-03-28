import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCuIZCRyyMPDQX5PtZI3zmyJfjsIkCkX1o",
  authDomain: "media-a7499.firebaseapp.com",
  projectId: "media-a7499",
  storageBucket: "media-a7499.firebasestorage.app",
  messagingSenderId: "1025937182778",
  appId: "1:1025937182778:web:7abe1d772da3889e57e503",
};

const VAPID_KEY = "BOcBvnDGEKsGCpW831keD3cBMq-MS7_6DiS05fSqiRAFpIoCl_DTDlJd2muTOQRl2TZLtNhE1eFHqDkg0rHsquI";

const app = initializeApp(firebaseConfig);

let messaging: ReturnType<typeof getMessaging> | null = null;

// Messaging only works in browsers that support it (not in iframes/SSR)
try {
  messaging = getMessaging(app);
} catch (e) {
  console.warn("Firebase Messaging not supported in this environment");
}

export { messaging, VAPID_KEY };

export async function requestFCMToken(): Promise<string | null> {
  if (!messaging) return null;
  
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log("FCM Token obtained:", token);
    return token;
  } catch (err) {
    console.error("Error getting FCM token:", err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}

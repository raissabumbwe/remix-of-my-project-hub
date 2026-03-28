import { useState, useEffect, useCallback } from "react";
import { requestFCMToken, onForegroundMessage } from "@/lib/firebase";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      console.log("Foreground message:", payload);
      toast(payload.notification?.title || "Nouvelle notification", {
        description: payload.notification?.body,
      });
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const saveFCMToken = useCallback(async (token: string) => {
    // Upsert token in push_subscriptions (use endpoint field for FCM token)
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        { endpoint: token, p256dh: "fcm", auth: "fcm" },
        { onConflict: "endpoint" }
      );
    if (error) console.error("Error saving FCM token:", error);
  }, []);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;

    try {
      const token = await requestFCMToken();
      if (token) {
        setPermission("granted");
        setFcmToken(token);
        await saveFCMToken(token);
        // Register the Firebase messaging service worker
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.register("/firebase-messaging-sw.js").catch(console.error);
        }
      } else {
        setPermission(Notification.permission);
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      setPermission("denied");
    }

    return Notification.permission;
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === "granted") {
      new Notification(title, options);
    }
  };

  return { permission, requestPermission, sendNotification, fcmToken };
};

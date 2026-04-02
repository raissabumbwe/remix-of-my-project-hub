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
    console.log("Saving FCM token to database...", token.substring(0, 20) + "...");
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        { endpoint: token, p256dh: "fcm", auth: "fcm" },
        { onConflict: "endpoint" }
      );
    if (error) {
      console.error("Error saving FCM token:", error);
      toast.error("Erreur lors de l'enregistrement des notifications");
    } else {
      console.log("FCM token saved successfully");
    }
  }, []);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") {
      console.warn("Notifications not supported in this browser");
      return "denied";
    }

    try {
      // Register the Firebase messaging service worker first
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
          console.log("Service worker registered:", registration.scope);
        } catch (swErr) {
          console.error("Service worker registration failed:", swErr);
        }
      }

      const token = await requestFCMToken();
      if (token) {
        console.log("FCM token obtained, saving...");
        setPermission("granted");
        setFcmToken(token);
        await saveFCMToken(token);
        toast.success("Notifications activées !");
      } else {
        console.warn("FCM token not obtained, permission:", Notification.permission);
        setPermission(Notification.permission);
        if (Notification.permission === "denied") {
          toast.error("Les notifications sont bloquées dans les paramètres du navigateur");
        }
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      setPermission("denied");
      toast.error("Erreur lors de l'activation des notifications");
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

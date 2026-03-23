import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";

const NotificationPrompt = () => {
  const { permission, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem("infoslight_notif_dismissed") === "true"
  );

  if (permission !== "default" || dismissed) return null;

  const handleAllow = async () => {
    await requestPermission();
    setDismissed(true);
    localStorage.setItem("infoslight_notif_dismissed", "true");
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("infoslight_notif_dismissed", "true");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto"
      >
        <div className="bg-card border border-border rounded-2xl p-4 shadow-elevated">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">
                Activer les notifications
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Soyez informé instantanément de chaque nouvelle actualité importante.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAllow}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg"
                >
                  Activer
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-medium rounded-lg"
                >
                  Plus tard
                </button>
              </div>
            </div>
            <button onClick={handleDismiss} className="p-1">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPrompt;

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Onboarding from "@/components/Onboarding";
import AuthPage from "@/components/AuthPage";
import AppHeader, { SideMenu } from "@/components/AppHeader";
import BottomNav, { type TabId } from "@/components/BottomNav";
import HomePage from "@/components/HomePage";
import LiveTVPage from "@/components/LiveTVPage";
import FMRadioPage from "@/components/FMRadioPage";
import LibraryPage from "@/components/LibraryPage";
import ExplorerPage from "@/components/ExplorerPage";
import NotificationPrompt from "@/components/NotificationPrompt";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("infoslight_onboarded");
  });
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const { isAdmin, user, loading } = useAuth();

  // Track online status
  useEffect(() => {
    if (!user) return;
    const setOnline = async (online: boolean) => {
      await supabase.from("profiles").update({
        is_online: online,
        last_seen_at: new Date().toISOString(),
      }).eq("id", user.id);
    };
    setOnline(true);
    const interval = setInterval(() => setOnline(true), 60000);
    const handleVisibility = () => setOnline(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", () => setOnline(false));
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      setOnline(false);
    };
  }, [user]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("infoslight_onboarded", "true");
    setShowOnboarding(false);
  };

  const handleLogoDoubleClick = () => {
    if (isAdmin) {
      setShowAdminDashboard(true);
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setShowAdminLogin(false);
    setShowAdminDashboard(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage initialCategory={selectedCategory} onCategoryReset={() => setSelectedCategory(null)} />;
      case "live-tv":
        return <LiveTVPage />;
      case "fm-live":
        return <FMRadioPage />;
      case "library":
        return <LibraryPage />;
      case "explorer":
        return <ExplorerPage />;
    }
  };

  // Show nothing while auth is loading
  if (loading) return null;

  // Show auth page if not logged in (after onboarding)
  const needsAuth = !user && !showOnboarding;

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {needsAuth && <AuthPage onSuccess={() => {}} />}

      {!showOnboarding && user && (
        <>
          <AppHeader
            onMenuOpen={() => setMenuOpen(true)}
            onLogoDoubleClick={handleLogoDoubleClick}
          />
          <SideMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            onCategorySelect={(cat) => {
              setSelectedCategory(cat);
              setActiveTab("home");
            }}
          />
          <main>{renderContent()}</main>
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          <NotificationPrompt />
        </>
      )}

      <AnimatePresence>
        {showAdminLogin && (
          <AdminLogin
            onBack={() => setShowAdminLogin(false)}
            onSuccess={handleAdminLoginSuccess}
          />
        )}
      </AnimatePresence>

      {showAdminDashboard && (
        <AdminDashboard onBack={() => setShowAdminDashboard(false)} />
      )}
    </div>
  );
};

export default Index;

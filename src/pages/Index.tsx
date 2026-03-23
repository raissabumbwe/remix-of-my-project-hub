import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Onboarding from "@/components/Onboarding";
import AppHeader, { SideMenu } from "@/components/AppHeader";
import BottomNav, { type TabId } from "@/components/BottomNav";
import HomePage from "@/components/HomePage";
import LiveTVPage from "@/components/LiveTVPage";
import FMRadioPage from "@/components/FMRadioPage";
import LibraryPage from "@/components/LibraryPage";
import ExplorerPage from "@/components/ExplorerPage";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("infoslight_onboarded");
  });
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleOnboardingComplete = () => {
    localStorage.setItem("infoslight_onboarded", "true");
    setShowOnboarding(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage />;
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

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {!showOnboarding && (
        <>
          <AppHeader onMenuOpen={() => setMenuOpen(true)} />
          <SideMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            onCategorySelect={(cat) => {
              setActiveTab("home");
            }}
          />
          <main>{renderContent()}</main>
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}
    </div>
  );
};

export default Index;

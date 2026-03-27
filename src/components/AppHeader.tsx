import { Menu, Search, Bell, X } from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo-infoslight.png";
import { categories } from "@/data/mock-data";

interface AppHeaderProps {
  onMenuOpen: () => void;
  onLogoDoubleClick: () => void;
}

const AppHeader = ({ onMenuOpen, onLogoDoubleClick }: AppHeaderProps) => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-destructive backdrop-blur-lg border-b-2 border-destructive safe-top">
      <div className="flex items-center h-14 px-4 gap-3">
        <button
          onClick={onMenuOpen}
          className="p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        <img
          src={logo}
          alt="Infoslight.cd"
          className="h-8 object-contain cursor-pointer"
          onDoubleClick={onLogoDoubleClick}
        />

        <div className="flex-1" />

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center px-4 bg-card z-10"
            >
              <input
                autoFocus
                type="text"
                placeholder="Rechercher un article..."
                className="flex-1 h-10 bg-secondary rounded-lg px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button onClick={() => setSearchOpen(false)} className="p-2 ml-2">
                <X className="w-5 h-5 text-foreground" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setSearchOpen(true)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Rechercher"
        >
          <Search className="w-5 h-5 text-foreground" />
        </button>

        <button
          className="p-2 rounded-lg hover:bg-secondary transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full" />
        </button>
      </div>
    </header>
  );
};

export default AppHeader;

export const SideMenu = ({
  open,
  onClose,
  onCategorySelect,
}: {
  open: boolean;
  onClose: () => void;
  onCategorySelect: (cat: string) => void;
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-card shadow-elevated flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center h-16 px-5 border-b border-border">
              <img src={logo} alt="Infoslight.cd" className="h-8 object-contain" />
              <button onClick={onClose} className="ml-auto p-2">
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              <p className="px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Rubriques
              </p>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onCategorySelect(cat);
                    onClose();
                  }}
                  className="w-full text-left px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  {cat}
                </button>
              ))}
              <div className="border-t border-border mt-4 pt-4">
                <button className="w-full text-left px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                  À propos de nous
                </button>
                <button className="w-full text-left px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                  Contactez-nous
                </button>
              </div>
            </nav>
            <div className="p-5 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                © 2026 Infoslight.cd — Ouvert au monde
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

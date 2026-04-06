import { motion, AnimatePresence } from "framer-motion";
import { MapPin, History, Users, Mountain, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import heroRdc from "@/assets/hero-rdc.jpg";

type ExplorerItem = Tables<"explorer_items">;

const iconMap: Record<string, React.ElementType> = {
  History,
  MapPin,
  Users,
  Mountain,
};

const colorMap: Record<string, { bg: string; icon: string }> = {
  Histoire: { bg: "bg-destructive/10", icon: "text-destructive" },
  Géographie: { bg: "bg-primary/10", icon: "text-primary" },
  Culture: { bg: "bg-accent/10", icon: "text-accent" },
  Tourisme: { bg: "bg-[hsl(var(--brand-blue-light))]/10", icon: "text-[hsl(var(--brand-blue-light))]" },
};

const facts = [
  { label: "Superficie", value: "2.345.410 km²" },
  { label: "Population", value: "~110M hab." },
  { label: "Capitale", value: "Kinshasa" },
  { label: "Monnaie", value: "Franc congolais" },
];

const ExplorerPage = () => {
  const [items, setItems] = useState<ExplorerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ExplorerItem | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("explorer_items")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      setItems(data ?? []);
      setLoading(false);
    };
    fetchItems();
  }, []);

  if (selectedItem) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="pb-20 min-h-screen bg-background"
      >
        <div className="relative">
          {selectedItem.image_url ? (
            <img src={selectedItem.image_url} alt={selectedItem.title} className="w-full h-56 object-cover" />
          ) : (
            <div className="w-full h-56 bg-gradient-to-br from-primary to-accent" />
          )}
          <div className="absolute inset-0 bg-hero-gradient" />
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 left-4 p-2 bg-card/80 backdrop-blur rounded-full"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        </div>
        <div className="p-5 -mt-6 relative bg-background rounded-t-2xl">
          <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3">
            {selectedItem.category}
          </span>
          <h1 className="font-display text-2xl font-bold text-foreground leading-tight mb-3">
            {selectedItem.title}
          </h1>
          <p className="text-foreground/70 text-sm leading-relaxed mb-4">{selectedItem.description}</p>
          {selectedItem.content && (
            <div
              className="prose prose-sm max-w-none text-foreground/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: selectedItem.content }}
            />
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="pb-20">
      <div className="relative h-52 overflow-hidden">
        <img src={heroRdc} alt="RDC" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-hero-gradient" />
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 -mt-4 relative z-10">
        {facts.map((fact) => (
          <div key={fact.label} className="bg-card rounded-xl p-3 shadow-card text-center">
            <p className="text-lg font-bold text-primary">{fact.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{fact.label}</p>
          </div>
        ))}
      </div>

      <div className="px-4 mt-6 space-y-3">
        <h3 className="font-display text-lg font-bold text-foreground">Découvrir</h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-4xl mb-3">🌍</span>
            <p className="text-sm text-muted-foreground text-center">Aucun contenu pour le moment</p>
          </div>
        ) : (
          items.map((item) => {
            const Icon = iconMap[item.icon] || MapPin;
            const colors = colorMap[item.category] || { bg: "bg-primary/10", icon: "text-primary" };
            return (
              <motion.button
                key={item.id}
                className="flex items-center gap-4 w-full p-4 bg-card rounded-xl shadow-card text-left"
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedItem(item)}
              >
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExplorerPage;

import { motion } from "framer-motion";
import { MapPin, History, Users, Mountain, ChevronRight } from "lucide-react";
import heroRdc from "@/assets/hero-rdc.jpg";

const sections = [
  {
    icon: History,
    title: "Histoire de la RDC",
    desc: "Chronologie interactive depuis l'indépendance",
    color: "bg-brand-red/10",
    iconColor: "text-brand-red",
  },
  {
    icon: MapPin,
    title: "Villes et villages",
    desc: "Fiches détaillées et cartes interactives",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Users,
    title: "Tribus et cultures",
    desc: "Traditions, langues et patrimoine",
    color: "bg-accent/10",
    iconColor: "text-accent",
  },
  {
    icon: Mountain,
    title: "Sites touristiques",
    desc: "Images, vidéos et géolocalisation",
    color: "bg-brand-blue-light/10",
    iconColor: "text-brand-blue-light",
  },
];

const facts = [
  { label: "Superficie", value: "2.345.410 km²" },
  { label: "Population", value: "~110M hab." },
  { label: "Capitale", value: "Kinshasa" },
  { label: "Monnaie", value: "Franc congolais" },
];

const ExplorerPage = () => {
  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="relative h-52 overflow-hidden">
        <img src={heroRdc} alt="RDC" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <h1 className="font-display text-3xl font-bold text-primary-foreground">
            Explorer la RDC
          </h1>
          <p className="text-primary-foreground/70 text-sm mt-1">
            Cœur de l'Afrique
          </p>
        </div>
      </div>

      {/* Quick facts */}
      <div className="grid grid-cols-2 gap-2 px-4 -mt-4 relative z-10">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="bg-card rounded-xl p-3 shadow-card text-center"
          >
            <p className="text-lg font-bold text-primary">{fact.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {fact.label}
            </p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="px-4 mt-6 space-y-3">
        <h3 className="font-display text-lg font-bold text-foreground">
          Découvrir
        </h3>
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <motion.button
              key={section.title}
              className="flex items-center gap-4 w-full p-4 bg-card rounded-xl shadow-card text-left"
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className={`w-6 h-6 ${section.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{section.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{section.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </motion.button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="px-4 mt-6">
        <motion.button
          className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-bold text-base shadow-elevated"
          whileTap={{ scale: 0.97 }}
        >
          Explorer la RDC, cœur de l'Afrique 🌍
        </motion.button>
      </div>
    </div>
  );
};

export default ExplorerPage;

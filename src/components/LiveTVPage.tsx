import { motion } from "framer-motion";
import { Play, Users, Clock } from "lucide-react";
import liveTvBg from "@/assets/live-tv-bg.jpg";

const LiveTVPage = () => {
  return (
    <div className="pb-20">
      {/* Video player area */}
      <div className="relative bg-foreground aspect-video">
        <img
          src={liveTvBg}
          alt="Live TV"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-elevated"
            whileTap={{ scale: 0.9 }}
          >
            <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
          </motion.button>
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-red rounded-full text-primary-foreground text-xs font-bold">
            <span className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse-live" />
            EN DIRECT
          </span>
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-foreground/60 rounded-full">
          <Users className="w-3.5 h-3.5 text-primary-foreground" />
          <span className="text-primary-foreground text-xs font-medium">1,247 spectateurs</span>
        </div>
      </div>

      {/* Current show info */}
      <div className="px-4 py-4">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Journal du Soir
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Présenté par Jean-Claude Mwanza
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" /> 18:00 - 19:00
            </span>
          </div>
          <p className="text-sm text-foreground/70">
            Les principales informations de la journée en RDC et dans le monde.
          </p>
        </div>

        {/* Programme */}
        <h3 className="font-display text-lg font-bold text-foreground mt-6 mb-3">
          Programme du jour
        </h3>
        {[
          { time: "06:00", name: "Réveil Infoslight", host: "Marie Landu" },
          { time: "09:00", name: "Matinale Économique", host: "Patrick Mbongo" },
          { time: "12:00", name: "Flash Info", host: "Sarah Kabila" },
          { time: "15:00", name: "Débat du Jour", host: "Jean-Pierre Mukendi" },
          { time: "18:00", name: "Journal du Soir", host: "Jean-Claude Mwanza", live: true },
          { time: "21:00", name: "Reportage Spécial", host: "Claude Mwamba" },
        ].map((show) => (
          <div
            key={show.time}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1.5 ${
              show.live ? "bg-primary/10 border border-primary/20" : "bg-card"
            }`}
          >
            <span className="text-sm font-mono font-semibold text-muted-foreground w-12">
              {show.time}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{show.name}</p>
              <p className="text-xs text-muted-foreground">{show.host}</p>
            </div>
            {show.live && (
              <span className="text-[10px] font-bold text-primary uppercase">En cours</span>
            )}
          </div>
        ))}

        {/* Replays */}
        <h3 className="font-display text-lg font-bold text-foreground mt-6 mb-3">
          Replays
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {["Interview Exclusive", "Grand Reportage", "Débat Politique", "Culture & Société"].map(
            (title) => (
              <motion.div
                key={title}
                className="bg-card rounded-xl overflow-hidden shadow-card"
                whileTap={{ scale: 0.97 }}
              >
                <div className="h-24 bg-brand-gradient flex items-center justify-center">
                  <Play className="w-8 h-8 text-primary-foreground/80" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground line-clamp-2">{title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Hier</p>
                </div>
              </motion.div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTVPage;

import { motion } from "framer-motion";
import { Play, Pause, SkipForward, Volume2, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";

const FMRadioPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="pb-20">
      {/* Radio player hero */}
      <div className="bg-brand-gradient px-6 pt-8 pb-10">
        <div className="text-center">
          <motion.div
            className="w-32 h-32 mx-auto rounded-full bg-primary-foreground/10 border-4 border-primary-foreground/20 flex items-center justify-center mb-5"
            animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="w-20 h-20 rounded-full bg-primary-foreground/15 flex items-center justify-center">
              <Volume2 className="w-10 h-10 text-primary-foreground" />
            </div>
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-primary-foreground">
            FM Infoslight
          </h1>
          <p className="text-primary-foreground/70 text-sm mt-1">Radio digitale immersive</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <button className="p-3 rounded-full bg-primary-foreground/10">
            <SkipForward className="w-5 h-5 text-primary-foreground rotate-180" />
          </button>
          <motion.button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-primary-foreground flex items-center justify-center shadow-elevated"
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-primary" fill="currentColor" />
            ) : (
              <Play className="w-7 h-7 text-primary ml-1" fill="currentColor" />
            )}
          </motion.button>
          <button className="p-3 rounded-full bg-primary-foreground/10">
            <SkipForward className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Quality selector */}
        <div className="flex justify-center gap-2 mt-5">
          {["Basse", "Moyenne", "Haute"].map((q, i) => (
            <button
              key={q}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                i === 2
                  ? "bg-primary-foreground text-primary"
                  : "bg-primary-foreground/15 text-primary-foreground/80"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Now playing */}
      <div className="px-4 -mt-4">
        <div className="bg-card rounded-xl p-4 shadow-elevated">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
            En cours
          </p>
          <h2 className="font-display text-lg font-bold text-foreground">
            Le Grand Débat
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Animé par Patrick Mbongo
          </p>
          <p className="text-xs text-foreground/70 mt-2">
            Sujet : L'avenir économique de la RDC face aux défis mondiaux
          </p>
        </div>
      </div>

      {/* Interactive features */}
      <div className="px-4 mt-6 space-y-3">
        <h3 className="font-display text-lg font-bold text-foreground">
          Interagir
        </h3>
        <motion.button
          className="flex items-center gap-3 w-full p-4 bg-card rounded-xl shadow-card"
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Messages auditeurs</p>
            <p className="text-xs text-muted-foreground">Envoyez votre message en direct</p>
          </div>
        </motion.button>
        <motion.button
          className="flex items-center gap-3 w-full p-4 bg-card rounded-xl shadow-card"
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Phone className="w-5 h-5 text-accent" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Appel en direct</p>
            <p className="text-xs text-muted-foreground">Participez à l'émission en cours</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default FMRadioPage;

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo-infoslight.png";
import heroRdc from "@/assets/hero-rdc.jpg";

interface OnboardingProps {
  onComplete: () => void;
}

const SplashScreen = ({ onNext }: { onNext: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onNext, 3500);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-gradient"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      <motion.img
        src={logo}
        alt="Infoslight.cd"
        className="w-48 h-48 object-contain mb-6"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      />
      <motion.p
        className="text-primary-foreground text-xl font-medium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        Bienvenue sur Infoslight.cd
      </motion.p>
      <motion.p
        className="text-primary-foreground/70 text-sm mt-2 uppercase tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Ouvert au monde
      </motion.p>
    </motion.div>
  );
};

const ExploreScreen = ({ onStart }: { onStart: () => void }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative flex-1">
        <img
          src={heroRdc}
          alt="RDC"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="relative z-10 flex flex-col items-center justify-end h-full pb-32 px-6 text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Explorez la RDC,
            <br />
            cœur de l'Afrique
          </motion.h1>
          <motion.p
            className="text-primary-foreground/80 text-base mb-8 max-w-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Activez les notifications pour être informé instantanément de chaque nouvelle actualité.
          </motion.p>
          <motion.button
            onClick={onStart}
            className="w-full max-w-xs py-4 rounded-xl bg-accent text-accent-foreground font-bold text-lg shadow-elevated active:scale-95 transition-transform"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileTap={{ scale: 0.95 }}
          >
            Démarrer
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(0);

  return (
    <AnimatePresence mode="wait">
      {step === 0 && <SplashScreen key="splash" onNext={() => setStep(1)} />}
      {step === 1 && <ExploreScreen key="explore" onStart={onComplete} />}
    </AnimatePresence>
  );
};

export default Onboarding;

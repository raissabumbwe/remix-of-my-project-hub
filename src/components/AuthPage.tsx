import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-infoslight_3.png";
import { toast } from "sonner";

interface AuthPageProps {
  onSuccess: () => void;
}

const AuthPage = ({ onSuccess }: AuthPageProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      if (!fullName.trim()) {
        setError("Veuillez entrer votre nom complet");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        setError(error.message === "User already registered" ? "Cet email est déjà utilisé" : error.message);
        setLoading(false);
        return;
      }
      toast.success("Compte créé ! Vérifiez votre email pour confirmer.");
      setMode("login");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
      return;
    }
    onSuccess();
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 bg-background flex flex-col"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <img src={logo} alt="Infoslight" className="h-20 object-contain mb-6" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          {mode === "login" ? "Bienvenue" : "Créer un compte"}
        </h1>
        <p className="text-sm text-muted-foreground mb-8 text-center">
          {mode === "login"
            ? "Connectez-vous pour accéder à l'actualité"
            : "Rejoignez la communauté Infoslight"}
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full h-11 px-4 bg-secondary rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              className="w-full h-11 px-4 bg-secondary rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="relative">
            <label className="text-xs font-medium text-foreground mb-1.5 block">Mot de passe</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-4 pr-12 bg-secondary rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[30px] p-1 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <p className="text-xs text-destructive font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "login" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
          className="mt-6 text-sm text-primary font-medium"
        >
          {mode === "login" ? "Pas de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </motion.div>
  );
};

export default AuthPage;

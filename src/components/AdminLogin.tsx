import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo-infoslight.png";

interface AdminLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

const AdminLogin = ({ onBack, onSuccess }: AdminLoginProps) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);
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
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      <div className="flex items-center h-14 px-4 border-b border-border">
        <button onClick={onBack} className="p-2 -ml-2">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground ml-2">Administration</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <img src={logo} alt="Infoslight" className="h-16 object-contain mb-8" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Connexion Admin
        </h1>
        <p className="text-sm text-muted-foreground mb-8 text-center">
          Accédez au tableau de bord d'administration
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@infoslight.cd"
              className="w-full h-11 px-4 bg-secondary rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-4 bg-secondary rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-destructive font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Se connecter
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default AdminLogin;

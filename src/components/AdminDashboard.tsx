import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Plus, Edit, Trash2, Tv, Radio, FileText,
  BarChart3, Users, Eye, LogOut, Loader2, Save, X, Camera, Image, Video, Play,
  TrendingUp, Activity, Globe, Clock, Heart, MessageCircle, Zap, Shield,
  BookOpen, MapPin, Compass
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";
import RichTextEditor from "@/components/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

type AdminTab = "stats" | "articles" | "tv" | "radio" | "live" | "users" | "library" | "explorer";

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("stats");

  const handleLogout = async () => {
    await signOut();
    onBack();
  };

  const tabs = [
    { id: "stats" as const, label: "Stats", icon: BarChart3 },
    { id: "articles" as const, label: "Articles", icon: FileText },
    { id: "users" as const, label: "Abonnés", icon: Users },
    { id: "live" as const, label: "Live", icon: Play },
    { id: "tv" as const, label: "TV", icon: Tv },
    { id: "radio" as const, label: "Radio", icon: Radio },
    { id: "library" as const, label: "Livres", icon: BookOpen },
    { id: "explorer" as const, label: "Explorer", icon: Compass },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Modern Header with gradient */}
      <div className="relative bg-gradient-to-r from-primary to-[hsl(var(--brand-blue-light))] px-4 pt-3 pb-16">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm">
            <ChevronLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-base font-bold text-primary-foreground tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-xs text-primary-foreground/70">Administration</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm"
          >
            <LogOut className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Tab bar floating over header */}
      <div className="-mt-10 mx-3 bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden z-10">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-all relative ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-primary/10" : ""}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="admin-tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pt-4 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "stats" && <StatsPanel />}
            {activeTab === "articles" && <ArticlesPanel />}
            {activeTab === "users" && <UsersPanel />}
            {activeTab === "live" && <LivePanel />}
            {activeTab === "tv" && <TVPanel />}
            {activeTab === "radio" && <RadioPanel />}
            {activeTab === "library" && <LibraryPanel />}
            {activeTab === "explorer" && <ExplorerPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ===== Stats Panel ===== */
const StatsPanel = () => {
  const [counts, setCounts] = useState({ articles: 0, tv: 0, radio: 0, users: 0, onlineUsers: 0, likes: 0, comments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      const [a, t, r, u, l, c] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("tv_channels").select("id", { count: "exact", head: true }),
        supabase.from("radio_stations").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("article_likes").select("id", { count: "exact", head: true }),
        supabase.from("article_comments").select("id", { count: "exact", head: true }),
      ]);
      const { data: onlineData } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_online", true);
      setCounts({
        articles: a.count ?? 0,
        tv: t.count ?? 0,
        radio: r.count ?? 0,
        users: u.count ?? 0,
        onlineUsers: onlineData?.length ?? 0,
        likes: l.count ?? 0,
        comments: c.count ?? 0,
      });
      setLoading(false);
    };
    fetchCounts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const mainStats = [
    {
      label: "Abonnés",
      value: counts.users,
      icon: Users,
      gradient: "from-[hsl(214,80%,42%)] to-[hsl(214,75%,55%)]",
      iconBg: "bg-primary-foreground/20",
    },
    {
      label: "Articles",
      value: counts.articles,
      icon: FileText,
      gradient: "from-[hsl(36,95%,45%)] to-[hsl(36,95%,58%)]",
      iconBg: "bg-primary-foreground/20",
    },
  ];

  const detailStats = [
    { label: "Chaînes TV", value: counts.tv, icon: Tv, color: "text-primary", bg: "bg-primary/10" },
    { label: "Stations FM", value: counts.radio, icon: Radio, color: "text-accent", bg: "bg-accent/10" },
    { label: "J'aime", value: counts.likes, icon: Heart, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Commentaires", value: counts.comments, icon: MessageCircle, color: "text-[hsl(var(--brand-blue-light))]", bg: "bg-primary/10" },
  ];

  return (
    <div className="px-4 space-y-4">
      {/* Big gradient stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-4 text-primary-foreground relative overflow-hidden`}
            >
              <div className="absolute -right-3 -bottom-3 opacity-10">
                <Icon className="w-20 h-20" />
              </div>
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold">{stat.value}</p>
              <p className="text-xs font-medium opacity-80">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-3">
        {detailStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/50 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity summary card */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Résumé d'activité
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Articles publiés</span>
              <span className="font-semibold text-foreground">{counts.articles}</span>
            </div>
            <Progress value={Math.min(counts.articles * 10, 100)} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Engagement (likes)</span>
              <span className="font-semibold text-foreground">{counts.likes}</span>
            </div>
            <Progress value={Math.min(counts.likes * 5, 100)} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Commentaires</span>
              <span className="font-semibold text-foreground">{counts.comments}</span>
            </div>
            <Progress value={Math.min(counts.comments * 5, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ===== Users Panel ===== */
const UsersPanel = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const { data } = await supabase.from("profiles").select("*").order("is_online", { ascending: false });
      setProfiles(data ?? []);
      setLoading(false);
    };
    fetchProfiles();

    const channel = supabase
      .channel("profiles-online")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        fetchProfiles();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const onlineCount = profiles.filter((p) => p.is_online).length;
  const offlineCount = profiles.length - onlineCount;

  return (
    <div className="px-4 space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>
            <p className="text-xl font-bold text-foreground">{onlineCount}</p>
            <p className="text-[10px] text-muted-foreground">En ligne</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
            </div>
            <p className="text-xl font-bold text-foreground">{offlineCount}</p>
            <p className="text-[10px] text-muted-foreground">Hors ligne</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">{profiles.length}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-2">
          {profiles.map((p) => (
            <Card key={p.id} className="border-border/50 shadow-sm overflow-hidden">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--brand-blue-light))] flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {(p.full_name || "U")[0].toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${p.is_online ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {p.full_name || "Utilisateur"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {p.is_online ? "En ligne maintenant" : `Vu le ${new Date(p.last_seen_at).toLocaleDateString("fr-FR")}`}
                  </p>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.is_online ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                  {p.is_online ? "Actif" : "Inactif"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

/* ===== Articles Panel ===== */
const ArticlesPanel = () => {
  const [articles, setArticles] = useState<Tables<"articles">[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tables<"articles"> | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    const { data } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    setArticles(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, []);

  const deleteArticle = async (id: string) => {
    await supabase.from("articles").delete().eq("id", id);
    toast.success("Article supprimé");
    fetchArticles();
  };

  if (editing) {
    return (
      <ArticleForm
        article={editing}
        onSave={() => { setEditing(null); fetchArticles(); }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  if (creating) {
    return (
      <ArticleForm
        onSave={() => { setCreating(false); fetchArticles(); }}
        onCancel={() => setCreating(false)}
      />
    );
  }

  return (
    <div className="px-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Articles</h2>
          <p className="text-xs text-muted-foreground">{articles.length} article{articles.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-[hsl(var(--brand-blue-light))] text-primary-foreground text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus className="w-4 h-4" /> Nouveau
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : articles.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucun article</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Créez votre premier article</p>
          </CardContent>
        </Card>
      ) : (
        articles.map((article) => (
          <Card key={article.id} className="border-border/50 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex items-stretch">
                {article.image_url && (
                  <div className="w-20 flex-shrink-0">
                    <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 p-3 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{article.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        {article.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${article.published ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                        {article.published ? "✓ Publié" : "Brouillon"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(article.created_at).toLocaleDateString("fr-FR")} · {article.author}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => setEditing(article)} className="p-2 hover:bg-primary/10 rounded-xl transition-colors">
                      <Edit className="w-4 h-4 text-primary" />
                    </button>
                    <button onClick={() => deleteArticle(article.id)} className="p-2 hover:bg-destructive/10 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

/* ===== Article Form ===== */
const ArticleForm = ({
  article,
  onSave,
  onCancel,
}: {
  article?: Tables<"articles">;
  onSave: () => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState({
    title: article?.title ?? "",
    summary: article?.summary ?? "",
    content: article?.content ?? "",
    category: article?.category ?? "Politique",
    author: article?.author ?? "",
    image_url: article?.image_url ?? "",
    published: article?.published ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(article?.image_url ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const categories = ["Politique", "Économie", "Sport", "Société", "Éducation", "Développement", "Écologie", "Diplomatie"];

  const uploadFile = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `articles/${fileName}`;

    const { error } = await supabase.storage.from("article-media").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("Upload error:", error);
      toast.error("Erreur lors de l'envoi du fichier");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("article-media").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    setForm((prev) => ({ ...prev, image_url: publicUrl }));
    setMediaPreview(publicUrl);
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const isVideo = (url: string) => /\.(mp4|webm|mov|avi)$/i.test(url);

  const handleSave = async () => {
    if (!form.title || !form.summary || !form.author) {
      toast.error("Veuillez remplir le titre, le résumé et l'auteur");
      return;
    }
    setSaving(true);
    try {
      if (article) {
        const { error } = await supabase.from("articles").update(form).eq("id", article.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("articles").insert(form as TablesInsert<"articles">);
        if (error) throw error;
      }
      toast.success(article ? "Article modifié !" : "Article publié !");
      
      if (form.published && (!article || !article.published)) {
        try {
          await supabase.functions.invoke("send-push-notification", {
            body: {
              title: `📰 ${form.title}`,
              body: form.summary,
            },
          });
          toast.success("Notification push envoyée !");
        } catch (e) {
          console.error("Push notification error:", e);
        }
      }
      
      onSave();
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Erreur : " + (err.message || "Erreur inconnue"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pb-8 space-y-5">
      {/* Form header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {article ? "Modifier l'article" : "Nouvel article"}
          </h2>
          <p className="text-xs text-muted-foreground">Remplissez les informations ci-dessous</p>
        </div>
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-4">
        <ModernInput label="Titre" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Titre de l'article" />
        <ModernInput label="Résumé" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} multiline placeholder="Résumé court de l'article" />
        
        <div>
          <label className="text-xs font-semibold text-foreground mb-2 block uppercase tracking-wide">Contenu</label>
          <div className="rounded-xl border border-border overflow-hidden">
            <RichTextEditor content={form.content} onChange={(v) => setForm({ ...form, content: v })} />
          </div>
        </div>

        <ModernInput label="Auteur" value={form.author} onChange={(v) => setForm({ ...form, author: v })} placeholder="Nom de l'auteur" />

        {/* Media Upload Section */}
        <div>
          <label className="text-xs font-semibold text-foreground mb-2 block uppercase tracking-wide">Image / Vidéo</label>
          
          {mediaPreview && (
            <div className="relative mb-3 rounded-2xl overflow-hidden bg-secondary border border-border">
              {isVideo(mediaPreview) ? (
                <video src={mediaPreview} controls className="w-full max-h-48 object-cover" />
              ) : (
                <img src={mediaPreview} alt="Aperçu" className="w-full max-h-48 object-cover" />
              )}
              <button
                onClick={() => { setMediaPreview(null); setForm({ ...form, image_url: "" }); }}
                className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur rounded-full flex items-center justify-center shadow-md"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
          )}

          {uploading && (
            <div className="flex items-center gap-2 py-6 justify-center text-sm text-muted-foreground bg-secondary rounded-2xl border border-border">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Envoi en cours...
            </div>
          )}

          {!mediaPreview && !uploading && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 flex flex-col items-center justify-center gap-2 h-24 bg-card rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Caméra</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex flex-col items-center justify-center gap-2 h-24 bg-card rounded-2xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center transition-colors">
                  <Image className="w-5 h-5 text-accent" />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Galerie</span>
              </button>
            </div>
          )}

          <input ref={cameraInputRef} type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={handleFileChange} />
          <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-2 block uppercase tracking-wide">Catégorie</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, category: c })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  form.category === c
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Publish toggle */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.published ? "bg-green-500/10" : "bg-muted"}`}>
                <Globe className={`w-5 h-5 ${form.published ? "text-green-600" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Publier</p>
                <p className="text-xs text-muted-foreground">Rendre visible aux abonnés</p>
              </div>
            </div>
            <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
          </CardContent>
        </Card>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 bg-gradient-to-r from-primary to-[hsl(var(--brand-blue-light))] text-primary-foreground font-bold text-sm rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl transition-shadow"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {article ? "Enregistrer les modifications" : "Publier l'article"}
        </button>
      </div>
    </div>
  );
};

/* ===== Live Panel ===== */
const LivePanel = () => {
  const [streams, setStreams] = useState<{ id: string; title: string; facebook_url: string; is_active: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editStream, setEditStream] = useState<any>(null);

  const fetchStreams = async () => {
    setLoading(true);
    const { data } = await supabase.from("live_streams").select("*").order("created_at", { ascending: false });
    setStreams((data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchStreams(); }, []);

  const deleteStream = async (id: string) => {
    await supabase.from("live_streams").delete().eq("id", id);
    toast.success("Live supprimé");
    fetchStreams();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("live_streams").update({ is_active: !current }).eq("id", id);
    toast.success(!current ? "Live activé" : "Live désactivé");
    fetchStreams();
  };

  if (showForm || editStream) {
    return (
      <LiveStreamForm
        stream={editStream}
        onSave={() => { setShowForm(false); setEditStream(null); fetchStreams(); }}
        onCancel={() => { setShowForm(false); setEditStream(null); }}
      />
    );
  }

  return (
    <div className="px-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Facebook Live</h2>
          <p className="text-xs text-muted-foreground">{streams.length} live{streams.length > 1 ? "s" : ""} configuré{streams.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-destructive to-[hsl(0,70%,50%)] text-primary-foreground text-xs font-bold rounded-xl shadow-md">
          <Plus className="w-4 h-4" /> Nouveau Live
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : streams.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-12 text-center">
            <Play className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucun live configuré</p>
          </CardContent>
        </Card>
      ) : (
        streams.map((s) => (
          <Card key={s.id} className={`border-border/50 shadow-sm overflow-hidden ${s.is_active ? "ring-2 ring-destructive/30" : ""}`}>
            <CardContent className="p-0">
              <div className="flex items-center gap-3 p-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.is_active ? "bg-destructive/10" : "bg-muted"}`}>
                  <Play className={`w-6 h-6 ${s.is_active ? "text-destructive" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{s.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{s.facebook_url}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.is_active ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                      {s.is_active ? "🔴 En direct" : "Inactif"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex border-t border-border">
                <button onClick={() => toggleActive(s.id, s.is_active)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium hover:bg-secondary transition-colors text-muted-foreground">
                  <Eye className="w-3.5 h-3.5" /> {s.is_active ? "Désactiver" : "Activer"}
                </button>
                <div className="w-px bg-border" />
                <button onClick={() => setEditStream(s)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium hover:bg-secondary transition-colors text-primary">
                  <Edit className="w-3.5 h-3.5" /> Modifier
                </button>
                <div className="w-px bg-border" />
                <button onClick={() => deleteStream(s.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium hover:bg-destructive/5 transition-colors text-destructive">
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

/* ===== Live Stream Form ===== */
const LiveStreamForm = ({
  stream,
  onSave,
  onCancel,
}: {
  stream?: any;
  onSave: () => void;
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState(stream?.title ?? "");
  const [facebookUrl, setFacebookUrl] = useState(stream?.facebook_url ?? "");
  const [isActive, setIsActive] = useState(stream?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !facebookUrl) {
      toast.error("Veuillez remplir le titre et le lien Facebook");
      return;
    }
    setSaving(true);
    try {
      const payload = { title, facebook_url: facebookUrl, is_active: isActive };
      if (stream) {
        const { error } = await supabase.from("live_streams").update(payload).eq("id", stream.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("live_streams").insert(payload);
        if (error) throw error;
      }
      toast.success(stream ? "Live modifié !" : "Live ajouté !");
      onSave();
    } catch (err: any) {
      toast.error("Erreur : " + (err.message || "Erreur inconnue"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pb-8 space-y-5">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {stream ? "Modifier le live" : "Nouveau live"}
          </h2>
          <p className="text-xs text-muted-foreground">Configuration du flux Facebook Live</p>
        </div>
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-secondary"><X className="w-5 h-5 text-muted-foreground" /></button>
      </div>
      <ModernInput label="Titre du live" value={title} onChange={setTitle} placeholder="Ex: Émission du soir" />
      <ModernInput label="Lien Facebook Live" value={facebookUrl} onChange={setFacebookUrl} placeholder="https://www.facebook.com/..." />
      
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? "bg-destructive/10" : "bg-muted"}`}>
              <Zap className={`w-5 h-5 ${isActive ? "text-destructive" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Activer le live</p>
              <p className="text-xs text-muted-foreground">Diffuser en direct</p>
            </div>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </CardContent>
      </Card>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-12 bg-gradient-to-r from-destructive to-[hsl(0,70%,50%)] text-primary-foreground font-bold text-sm rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        Enregistrer
      </button>
    </div>
  );
};

/* ===== TV Panel ===== */
const TVPanel = () => {
  const [channels, setChannels] = useState<Tables<"tv_channels">[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Tables<"tv_channels"> | null>(null);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("tv_channels").select("*").order("created_at", { ascending: false });
    setChannels(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const deleteItem = async (id: string) => {
    await supabase.from("tv_channels").delete().eq("id", id);
    toast.success("Chaîne supprimée");
    fetch();
  };

  if (showForm || editItem) {
    return (
      <MediaForm
        type="tv"
        item={editItem}
        onSave={() => { setShowForm(false); setEditItem(null); fetch(); }}
        onCancel={() => { setShowForm(false); setEditItem(null); }}
      />
    );
  }

  return (
    <div className="px-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Chaînes TV</h2>
          <p className="text-xs text-muted-foreground">{channels.length} chaîne{channels.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-[hsl(var(--brand-blue-light))] text-primary-foreground text-xs font-bold rounded-xl shadow-md">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : channels.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-12 text-center">
            <Tv className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune chaîne TV</p>
          </CardContent>
        </Card>
      ) : (
        channels.map((ch) => (
          <Card key={ch.id} className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${ch.is_live ? "bg-primary/10" : "bg-muted"}`}>
                <Tv className={`w-6 h-6 ${ch.is_live ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{ch.name}</p>
                <span className={`text-[10px] font-bold ${ch.is_live ? "text-green-600" : "text-muted-foreground"}`}>
                  {ch.is_live ? "🔴 En direct" : "Hors ligne"}
                </span>
              </div>
              <button onClick={() => setEditItem(ch)} className="p-2 hover:bg-primary/10 rounded-xl">
                <Edit className="w-4 h-4 text-primary" />
              </button>
              <button onClick={() => deleteItem(ch.id)} className="p-2 hover:bg-destructive/10 rounded-xl">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

/* ===== Radio Panel ===== */
const RadioPanel = () => {
  const [stations, setStations] = useState<Tables<"radio_stations">[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Tables<"radio_stations"> | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("radio_stations").select("*").order("created_at", { ascending: false });
    setStations(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const deleteItem = async (id: string) => {
    await supabase.from("radio_stations").delete().eq("id", id);
    toast.success("Station supprimée");
    fetchData();
  };

  if (showForm || editItem) {
    return (
      <MediaForm
        type="radio"
        item={editItem}
        onSave={() => { setShowForm(false); setEditItem(null); fetchData(); }}
        onCancel={() => { setShowForm(false); setEditItem(null); }}
      />
    );
  }

  return (
    <div className="px-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Stations FM</h2>
          <p className="text-xs text-muted-foreground">{stations.length} station{stations.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent to-[hsl(36,95%,58%)] text-primary-foreground text-xs font-bold rounded-xl shadow-md">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : stations.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-12 text-center">
            <Radio className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune station FM</p>
          </CardContent>
        </Card>
      ) : (
        stations.map((st) => (
          <Card key={st.id} className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${st.is_live ? "bg-accent/10" : "bg-muted"}`}>
                <Radio className={`w-6 h-6 ${st.is_live ? "text-accent" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{st.name}</p>
                <p className="text-xs text-muted-foreground">
                  {st.is_live ? "🔴 En direct" : "Hors ligne"}
                  {st.current_show && ` — ${st.current_show}`}
                </p>
              </div>
              <button onClick={() => setEditItem(st)} className="p-2 hover:bg-accent/10 rounded-xl">
                <Edit className="w-4 h-4 text-accent" />
              </button>
              <button onClick={() => deleteItem(st.id)} className="p-2 hover:bg-destructive/10 rounded-xl">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

/* ===== Media Form (TV/Radio) ===== */
const MediaForm = ({
  type,
  item,
  onSave,
  onCancel,
}: {
  type: "tv" | "radio";
  item?: Tables<"tv_channels"> | Tables<"radio_stations"> | null;
  onSave: () => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [streamUrl, setStreamUrl] = useState(item?.stream_url ?? "");
  const [isLive, setIsLive] = useState(item?.is_live ?? false);
  const [saving, setSaving] = useState(false);

  const isTV = type === "tv";

  const handleSave = async () => {
    setSaving(true);
    const table = isTV ? "tv_channels" : "radio_stations";
    const payload = { name, description, stream_url: streamUrl, is_live: isLive };

    if (item) {
      await supabase.from(table).update(payload).eq("id", item.id);
    } else {
      await supabase.from(table).insert(payload);
    }
    toast.success(item ? "Modifié avec succès !" : "Ajouté avec succès !");
    setSaving(false);
    onSave();
  };

  return (
    <div className="px-4 pb-8 space-y-5">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {item ? "Modifier" : "Ajouter"} {isTV ? "chaîne TV" : "station FM"}
          </h2>
          <p className="text-xs text-muted-foreground">Configurez les détails {isTV ? "de la chaîne" : "de la station"}</p>
        </div>
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-secondary"><X className="w-5 h-5 text-muted-foreground" /></button>
      </div>
      <ModernInput label="Nom" value={name} onChange={setName} placeholder={`Nom ${isTV ? "de la chaîne" : "de la station"}`} />
      <ModernInput label="Description" value={description} onChange={setDescription} multiline placeholder="Description courte" />
      <ModernInput label="URL du flux" value={streamUrl} onChange={setStreamUrl} placeholder="https://..." />
      
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLive ? (isTV ? "bg-primary/10" : "bg-accent/10") : "bg-muted"}`}>
              {isTV ? <Tv className={`w-5 h-5 ${isLive ? "text-primary" : "text-muted-foreground"}`} /> : <Radio className={`w-5 h-5 ${isLive ? "text-accent" : "text-muted-foreground"}`} />}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">En direct</p>
              <p className="text-xs text-muted-foreground">Marquer comme diffusant en direct</p>
            </div>
          </div>
          <Switch checked={isLive} onCheckedChange={setIsLive} />
        </CardContent>
      </Card>

      <button
        onClick={handleSave}
        disabled={saving || !name}
        className={`w-full h-12 bg-gradient-to-r ${isTV ? "from-primary to-[hsl(var(--brand-blue-light))]" : "from-accent to-[hsl(36,95%,58%)]"} text-primary-foreground font-bold text-sm rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg`}
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        Enregistrer
      </button>
    </div>
  );
};

/* ===== Modern Form Input ===== */
const ModernInput = ({
  label,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) => (
  <div>
    <label className="text-xs font-semibold text-foreground mb-2 block uppercase tracking-wide">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-card rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 outline-none border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 px-4 bg-card rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 outline-none border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
      />
    )}
  </div>
);

export default AdminDashboard;

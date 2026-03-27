import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft, Plus, Edit, Trash2, Tv, Radio, FileText,
  BarChart3, Users, Eye, LogOut, Loader2, Save, X, Camera, Image, Video, Play
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";

type AdminTab = "stats" | "articles" | "tv" | "radio" | "live";

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
    { id: "live" as const, label: "Live", icon: Play },
    { id: "tv" as const, label: "TV", icon: Tv },
    { id: "radio" as const, label: "Radio", icon: Radio },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center h-14 px-4 border-b border-border bg-card">
        <button onClick={onBack} className="p-2 -ml-2">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <span className="text-sm font-bold text-foreground ml-2 flex-1">
          Tableau de bord
        </span>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <LogOut className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border bg-card">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors border-b-2 ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "stats" && <StatsPanel />}
        {activeTab === "articles" && <ArticlesPanel />}
        {activeTab === "live" && <LivePanel />}
        {activeTab === "tv" && <TVPanel />}
        {activeTab === "radio" && <RadioPanel />}
      </div>
    </motion.div>
  );
};

/* ===== Stats Panel ===== */
const StatsPanel = () => {
  const [counts, setCounts] = useState({ articles: 0, tv: 0, radio: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      const [a, t, r] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("tv_channels").select("id", { count: "exact", head: true }),
        supabase.from("radio_stations").select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        articles: a.count ?? 0,
        tv: t.count ?? 0,
        radio: r.count ?? 0,
      });
    };
    fetchCounts();
  }, []);

  const stats = [
    { label: "Articles", value: counts.articles, icon: FileText, color: "bg-primary/10 text-primary" },
    { label: "Chaînes TV", value: counts.tv, icon: Tv, color: "bg-accent/10 text-accent" },
    { label: "Stations FM", value: counts.radio, icon: Radio, color: "bg-brand-red/10 text-brand-red" },
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="font-display text-lg font-bold text-foreground">Statistiques</h2>
      <div className="grid grid-cols-1 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-4 p-4 bg-card rounded-xl shadow-card">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
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
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">Articles</h2>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg"
        >
          <Plus className="w-4 h-4" /> Nouveau
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : articles.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucun article</p>
      ) : (
        articles.map((article) => (
          <div key={article.id} className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-card">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground line-clamp-1">{article.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-primary uppercase">{article.category}</span>
                <span className={`text-[10px] font-bold ${article.published ? "text-green-600" : "text-muted-foreground"}`}>
                  {article.published ? "Publié" : "Brouillon"}
                </span>
              </div>
            </div>
            <button onClick={() => setEditing(article)} className="p-2 hover:bg-secondary rounded-lg">
              <Edit className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => deleteArticle(article.id)} className="p-2 hover:bg-destructive/10 rounded-lg">
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>
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
      onSave();
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Erreur lors de l'enregistrement : " + (err.message || "Erreur inconnue"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          {article ? "Modifier l'article" : "Nouvel article"}
        </h2>
        <button onClick={onCancel} className="p-2">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-3">
        <FormInput label="Titre" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <FormInput label="Résumé" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} multiline />
        <FormInput label="Contenu" value={form.content} onChange={(v) => setForm({ ...form, content: v })} multiline />
        <FormInput label="Auteur" value={form.author} onChange={(v) => setForm({ ...form, author: v })} />

        {/* Media Upload Section */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">Image / Vidéo</label>
          
          {/* Preview */}
          {mediaPreview && (
            <div className="relative mb-2 rounded-xl overflow-hidden bg-secondary">
              {isVideo(mediaPreview) ? (
                <video src={mediaPreview} controls className="w-full max-h-48 object-cover rounded-xl" />
              ) : (
                <img src={mediaPreview} alt="Aperçu" className="w-full max-h-48 object-cover rounded-xl" />
              )}
              <button
                onClick={() => { setMediaPreview(null); setForm({ ...form, image_url: "" }); }}
                className="absolute top-2 right-2 w-7 h-7 bg-background/80 backdrop-blur rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
          )}

          {uploading && (
            <div className="flex items-center gap-2 py-3 justify-center text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...
            </div>
          )}

          {!mediaPreview && !uploading && (
            <div className="flex gap-2">
              {/* Camera capture */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 h-20 bg-secondary rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors"
              >
                <Camera className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Caméra</span>
              </button>
              {/* Gallery pick */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 h-20 bg-secondary rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors"
              >
                <Image className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Galerie</span>
              </button>
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*,video/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">Catégorie</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full h-11 px-4 bg-secondary rounded-xl text-sm text-foreground outline-none"
          >
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm text-foreground">Publier immédiatement</span>
        </label>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer
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
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">Facebook Live</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg">
          <Plus className="w-4 h-4" /> Nouveau Live
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : streams.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucun live configuré</p>
      ) : (
        streams.map((s) => (
          <div key={s.id} className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-card">
            <Play className="w-5 h-5 text-destructive flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground line-clamp-1">{s.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{s.facebook_url}</p>
              <span className={`text-[10px] font-bold ${s.is_active ? "text-green-600" : "text-muted-foreground"}`}>
                {s.is_active ? "🔴 Actif" : "Inactif"}
              </span>
            </div>
            <button onClick={() => toggleActive(s.id, s.is_active)} className="p-2 hover:bg-secondary rounded-lg" title="Activer/Désactiver">
              <Eye className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => setEditStream(s)} className="p-2 hover:bg-secondary rounded-lg">
              <Edit className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => deleteStream(s.id)} className="p-2 hover:bg-destructive/10 rounded-lg">
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>
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
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          {stream ? "Modifier le live" : "Nouveau live"}
        </h2>
        <button onClick={onCancel} className="p-2"><X className="w-5 h-5 text-muted-foreground" /></button>
      </div>
      <FormInput label="Titre du live" value={title} onChange={setTitle} />
      <FormInput label="Lien Facebook Live" value={facebookUrl} onChange={setFacebookUrl} />
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded" />
        <span className="text-sm text-foreground">Activer le live</span>
      </label>
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">Chaînes TV</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : channels.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucune chaîne</p>
      ) : (
        channels.map((ch) => (
          <div key={ch.id} className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-card">
            <Tv className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{ch.name}</p>
              <p className="text-xs text-muted-foreground">{ch.is_live ? "🔴 En direct" : "Hors ligne"}</p>
            </div>
            <button onClick={() => setEditItem(ch)} className="p-2 hover:bg-secondary rounded-lg">
              <Edit className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => deleteItem(ch.id)} className="p-2 hover:bg-destructive/10 rounded-lg">
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>
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
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">Stations FM</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : stations.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucune station</p>
      ) : (
        stations.map((st) => (
          <div key={st.id} className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-card">
            <Radio className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{st.name}</p>
              <p className="text-xs text-muted-foreground">
                {st.is_live ? "🔴 En direct" : "Hors ligne"}
                {st.current_show && ` — ${st.current_show}`}
              </p>
            </div>
            <button onClick={() => setEditItem(st)} className="p-2 hover:bg-secondary rounded-lg">
              <Edit className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => deleteItem(st.id)} className="p-2 hover:bg-destructive/10 rounded-lg">
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>
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

  const handleSave = async () => {
    setSaving(true);
    const table = type === "tv" ? "tv_channels" : "radio_stations";
    const payload = { name, description, stream_url: streamUrl, is_live: isLive };

    if (item) {
      await supabase.from(table).update(payload).eq("id", item.id);
    } else {
      await supabase.from(table).insert(payload);
    }
    setSaving(false);
    onSave();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          {item ? "Modifier" : "Ajouter"} {type === "tv" ? "chaîne TV" : "station FM"}
        </h2>
        <button onClick={onCancel} className="p-2"><X className="w-5 h-5 text-muted-foreground" /></button>
      </div>
      <FormInput label="Nom" value={name} onChange={setName} />
      <FormInput label="Description" value={description} onChange={setDescription} multiline />
      <FormInput label="URL du flux" value={streamUrl} onChange={setStreamUrl} />
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} className="w-4 h-4 rounded" />
        <span className="text-sm text-foreground">En direct</span>
      </label>
      <button
        onClick={handleSave}
        disabled={saving || !name}
        className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Enregistrer
      </button>
    </div>
  );
};

/* ===== Reusable FormInput ===== */
const FormInput = ({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) => (
  <div>
    <label className="text-xs font-medium text-foreground mb-1.5 block">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-4 py-3 bg-secondary rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary resize-none"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 bg-secondary rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
      />
    )}
  </div>
);

export default AdminDashboard;

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Clock, Share2, ChevronLeft, ChevronRight, Loader2, Heart, MessageCircle, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { categories } from "@/data/mock-data";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Article = Tables<"articles">;

const timeAgo = (date: string) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
  } catch {
    return "";
  }
};

const ArticleCard = ({
  article,
  featured,
  onClick,
}: {
  article: Article;
  featured?: boolean;
  onClick: () => void;
}) => {
  if (featured) {
    return (
      <motion.button
        onClick={onClick}
        className="relative w-full rounded-xl overflow-hidden shadow-card group text-left"
        whileTap={{ scale: 0.98 }}
      >
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-52 object-cover"
          />
        ) : (
          <div className="w-full h-52 bg-secondary flex items-center justify-center">
            <span className="text-4xl">📰</span>
          </div>
        )}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="inline-block px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded uppercase mb-2">
            {article.category}
          </span>
          <h2 className="text-primary-foreground font-display text-lg font-bold leading-snug line-clamp-2">
            {article.title}
          </h2>
          <p className="text-primary-foreground/70 text-xs mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {timeAgo(article.created_at)}
          </p>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      className="flex gap-3 p-3 bg-card rounded-xl shadow-card text-left w-full"
      whileTap={{ scale: 0.98 }}
    >
      {article.image_url ? (
        <img
          src={article.image_url}
          alt={article.title}
          className="w-24 h-20 rounded-lg object-cover flex-shrink-0"
          loading="lazy"
        />
      ) : (
        <div className="w-24 h-20 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">📰</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold text-primary uppercase">
          {article.category}
        </span>
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 mt-0.5 leading-snug">
          {article.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {timeAgo(article.created_at)}
        </p>
      </div>
    </motion.button>
  );
};

const ArticleDetail = ({
  article,
  onBack,
}: {
  article: Article;
  onBack: () => void;
}) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [likesRes, commentsRes] = await Promise.all([
        supabase.from("article_likes").select("*", { count: "exact" }).eq("article_id", article.id),
        supabase.from("article_comments").select("*, profiles(full_name)").eq("article_id", article.id).order("created_at", { ascending: true }),
      ]);
      setLikesCount(likesRes.count ?? 0);
      setComments((commentsRes.data as any[]) ?? []);
      if (user) {
        const { data } = await supabase.from("article_likes").select("id").eq("article_id", article.id).eq("user_id", user.id).maybeSingle();
        setLiked(!!data);
      }
    };
    fetchData();
  }, [article.id, user]);

  const toggleLike = async () => {
    if (!user) { toast.error("Connectez-vous pour aimer"); return; }
    if (liked) {
      await supabase.from("article_likes").delete().eq("article_id", article.id).eq("user_id", user.id);
      setLiked(false);
      setLikesCount((c) => c - 1);
    } else {
      await supabase.from("article_likes").insert({ article_id: article.id, user_id: user.id });
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
  };

  const submitComment = async () => {
    if (!user) { toast.error("Connectez-vous pour commenter"); return; }
    if (!commentText.trim()) return;
    setSubmitting(true);
    const { data } = await supabase.from("article_comments").insert({
      article_id: article.id,
      user_id: user.id,
      content: commentText.trim(),
    }).select("*, profiles(full_name)").single();
    if (data) setComments((c) => [...c, data]);
    setCommentText("");
    setSubmitting(false);
  };

  const shareArticle = (platform: string) => {
    const url = window.location.origin + "/?article=" + article.id;
    const text = article.title;
    const links: Record<string, string> = {
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      WhatsApp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      Twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      Telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };
    window.open(links[platform], "_blank", "noopener,noreferrer");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin + "/?article=" + article.id);
    toast.success("Lien copié !");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="min-h-screen bg-background pb-20"
    >
      <div className="relative">
        {article.image_url ? (
          <img src={article.image_url} alt={article.title} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 bg-secondary" />
        )}
        <div className="absolute inset-0 bg-hero-gradient" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-card/80 backdrop-blur rounded-full"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="p-5 -mt-6 relative bg-background rounded-t-2xl">
        <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3">
          {article.category}
        </span>
        <h1 className="font-display text-2xl font-bold text-foreground leading-tight mb-3">
          {article.title}
        </h1>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-5">
          <span>{article.author}</span>
          <span>•</span>
          <span>{timeAgo(article.created_at)}</span>
        </div>
        <p className="text-foreground/80 text-sm leading-relaxed mb-4">
          {article.summary}
        </p>
        {article.content && (
          <div
            className="prose prose-sm max-w-none text-foreground/80 leading-relaxed mb-6 [&_*]:all-revert-layer"
            style={{ all: "initial", fontFamily: "inherit", color: "inherit" }}
          >
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        )}

        {/* Like, Comment, Share bar */}
        <div className="flex items-center gap-1 py-3 border-y border-border mb-4">
          <button
            onClick={toggleLike}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full hover:bg-secondary transition-colors"
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
            <span className="text-sm font-medium text-foreground">{likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full hover:bg-secondary transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{comments.length}</span>
          </button>

          <div className="flex-1" />

          <button onClick={copyLink} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <Share2 className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs text-muted-foreground">Partager :</span>
          {["Facebook", "WhatsApp", "Twitter", "Telegram"].map((s) => (
            <button
              key={s}
              onClick={() => shareArticle(s)}
              className="px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Comments section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <h3 className="text-sm font-bold text-foreground mb-3">
                Commentaires ({comments.length})
              </h3>

              {comments.length === 0 && (
                <p className="text-xs text-muted-foreground mb-4">Aucun commentaire. Soyez le premier !</p>
              )}

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {comments.map((c) => (
                  <div key={c.id} className="bg-secondary rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">
                        {c.profiles?.full_name || "Utilisateur"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(c.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80">{c.content}</p>
                  </div>
                ))}
              </div>

              {/* Comment input */}
              {user && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Écrire un commentaire..."
                    className="flex-1 h-10 px-4 bg-secondary rounded-full text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={(e) => e.key === "Enter" && submitComment()}
                  />
                  <button
                    onClick={submitComment}
                    disabled={submitting || !commentText.trim()}
                    className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState("À la Une");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      setArticles(data ?? []);
      setLoading(false);
    };
    fetchArticles();
  }, []);

  const latestFive = articles.slice(0, 5);

  const nextSlide = useCallback(() => {
    setSlideIndex((i) => (i + 1) % (latestFive.length || 1));
  }, [latestFive.length]);

  useEffect(() => {
    if (latestFive.length <= 1) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide, latestFive.length]);

  const filteredArticles =
    activeCategory === "À la Une"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  if (selectedArticle) {
    return (
      <ArticleDetail
        article={selectedArticle}
        onBack={() => setSelectedArticle(null)}
      />
    );
  }

  return (
    <div className="pb-20">
      {/* Hero Slider - 5 derniers articles */}
      {!loading && latestFive.length > 0 && (
        <div className="relative mb-4">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.button
                key={latestFive[slideIndex]?.id}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4 }}
                className="relative w-full text-left"
                onClick={() => setSelectedArticle(latestFive[slideIndex])}
              >
                {latestFive[slideIndex]?.image_url ? (
                  <img
                    src={latestFive[slideIndex].image_url!}
                    alt={latestFive[slideIndex].title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-secondary flex items-center justify-center">
                    <span className="text-5xl">📰</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded uppercase mb-1.5">
                    {latestFive[slideIndex].category}
                  </span>
                  <h2 className="text-white font-display text-base font-bold leading-snug line-clamp-2">
                    {latestFive[slideIndex].title}
                  </h2>
                  <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeAgo(latestFive[slideIndex].created_at)}
                  </p>
                </div>
              </motion.button>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          {latestFive.length > 1 && (
            <>
              <button
                onClick={() => setSlideIndex((i) => (i - 1 + latestFive.length) % latestFive.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full backdrop-blur-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSlideIndex((i) => (i + 1) % latestFive.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full backdrop-blur-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {latestFive.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === slideIndex ? "bg-white w-4" : "bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Category pills */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <span className="text-4xl mb-3">📭</span>
          <p className="text-sm text-muted-foreground text-center">
            Aucun article pour le moment
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => setSelectedArticle(article)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;

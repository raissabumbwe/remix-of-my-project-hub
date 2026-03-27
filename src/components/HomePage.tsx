import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Clock, Share2, ChevronLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { categories } from "@/data/mock-data";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

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
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="min-h-screen bg-background"
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
        <p className="text-foreground/80 text-sm leading-relaxed mb-6">
          {article.summary}
        </p>
        {article.content && (
          <p className="text-foreground/80 text-sm leading-relaxed mb-6">
            {article.content}
          </p>
        )}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">Partager :</span>
          {["Facebook", "WhatsApp", "Twitter"].map((s) => (
            <button
              key={s}
              className="px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState("À la Une");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

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
          {/* Featured article */}
          {filteredArticles[0] && (
            <ArticleCard
              article={filteredArticles[0]}
              featured
              onClick={() => setSelectedArticle(filteredArticles[0])}
            />
          )}

          {/* Article list */}
          {filteredArticles.length > 1 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Dernières actualités
              </h3>
              {filteredArticles.slice(1).map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => setSelectedArticle(article)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;

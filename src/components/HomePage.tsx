import { motion } from "framer-motion";
import { articles, categories, type Article } from "@/data/mock-data";
import { useState } from "react";
import { Clock, Share2, ChevronLeft } from "lucide-react";

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
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-52 object-cover"
        />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="inline-block px-2 py-0.5 bg-brand-red text-primary-foreground text-[10px] font-bold rounded uppercase mb-2">
            {article.category}
          </span>
          <h2 className="text-primary-foreground font-display text-lg font-bold leading-snug line-clamp-2">
            {article.title}
          </h2>
          <p className="text-primary-foreground/70 text-xs mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {article.timeAgo}
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
      <img
        src={article.image}
        alt={article.title}
        className="w-24 h-20 rounded-lg object-cover flex-shrink-0"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold text-primary uppercase">
          {article.category}
        </span>
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 mt-0.5 leading-snug">
          {article.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {article.timeAgo}
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
        <img src={article.image} alt={article.title} className="w-full h-56 object-cover" />
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
          <span>{article.timeAgo}</span>
        </div>
        <p className="text-foreground/80 text-sm leading-relaxed mb-6">
          {article.summary}
        </p>
        <p className="text-foreground/80 text-sm leading-relaxed mb-6">
          {article.content} Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
        </p>
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

      <div className="px-4 space-y-3">
        {/* Featured article */}
        {filteredArticles[0] && (
          <ArticleCard
            article={filteredArticles[0]}
            featured
            onClick={() => setSelectedArticle(filteredArticles[0])}
          />
        )}

        {/* Breaking news banner */}
        <div className="flex items-center gap-2 px-3 py-2 bg-brand-red/10 rounded-lg">
          <span className="flex items-center gap-1 text-[10px] font-bold text-brand-red uppercase">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse-live" />
            En direct
          </span>
          <span className="text-xs text-foreground font-medium truncate">
            Suivez notre couverture en direct des événements
          </span>
        </div>

        {/* Article list */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Depuis votre dernière visite
          </h3>
          {filteredArticles.slice(1).map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => setSelectedArticle(article)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

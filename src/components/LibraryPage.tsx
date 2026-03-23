import { motion } from "framer-motion";
import { Star, Download, BookOpen, Moon, Headphones, ChevronLeft } from "lucide-react";
import { books } from "@/data/mock-data";
import { useState } from "react";
import libraryBg from "@/assets/library-bg.jpg";

const bookCategories = ["Tous", "Histoire", "Politique", "Économie", "Culture"];

const LibraryPage = () => {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [selectedBook, setSelectedBook] = useState<(typeof books)[0] | null>(null);

  const filtered =
    activeCategory === "Tous"
      ? books
      : books.filter((b) => b.category === activeCategory);

  if (selectedBook) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="pb-20"
      >
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => setSelectedBook(null)} className="p-2 -ml-2">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">Détail du livre</h1>
        </div>
        <div className="px-6 text-center pb-6">
          <div className="w-32 h-44 mx-auto rounded-xl bg-brand-gradient flex items-center justify-center text-5xl mb-5 shadow-elevated">
            {selectedBook.cover}
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">{selectedBook.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{selectedBook.author}</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(selectedBook.rating) ? "text-accent fill-accent" : "text-muted"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">{selectedBook.rating}</span>
          </div>
          <p className="text-sm text-foreground/70 mt-4">{selectedBook.description}</p>
        </div>

        {/* Purchase options */}
        <div className="px-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground">Options d'accès</h3>
          <button className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-card">
            Acheter — {selectedBook.price}
          </button>
          <button className="w-full py-3.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-card">
            Abonnement illimité — 4.99$/mois
          </button>
          <div className="flex gap-2 mt-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium">
              <Download className="w-4 h-4" /> PDF
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium">
              <BookOpen className="w-4 h-4" /> Lire en ligne
            </button>
          </div>

          <h3 className="text-sm font-bold text-foreground mt-5">Bonus</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Headphones, label: "Audio" },
              { icon: BookOpen, label: "Notes" },
              { icon: Moon, label: "Mode nuit" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 p-3 bg-card rounded-xl shadow-card"
              >
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-medium text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="relative h-40 overflow-hidden">
        <img src={libraryBg} alt="Bibliothèque" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="font-display text-2xl font-bold text-primary-foreground">
            Bibliothèque virtuelle
          </h1>
          <p className="text-primary-foreground/70 text-sm mt-1">
            Le Netflix du livre congolais et africain
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar">
        {bookCategories.map((cat) => (
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

      {/* Book grid */}
      <div className="px-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Livres populaires
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((book) => (
            <motion.button
              key={book.id}
              onClick={() => setSelectedBook(book)}
              className="bg-card rounded-xl overflow-hidden shadow-card text-left"
              whileTap={{ scale: 0.97 }}
            >
              <div className="h-32 bg-brand-gradient flex items-center justify-center text-4xl">
                {book.cover}
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-foreground line-clamp-2">{book.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{book.author}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-bold text-primary">{book.price}</span>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    <span className="text-[10px] text-muted-foreground">{book.rating}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;

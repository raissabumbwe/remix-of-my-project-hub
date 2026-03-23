import article1 from "@/assets/news/article-1.jpg";
import article2 from "@/assets/news/article-2.jpg";
import article3 from "@/assets/news/article-3.jpg";
import article4 from "@/assets/news/article-4.jpg";
import article5 from "@/assets/news/article-5.jpg";

export interface Article {
  id: string;
  title: string;
  summary: string;
  image: string;
  category: string;
  timeAgo: string;
  author: string;
  content: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  price: string;
  category: string;
  rating: number;
  description: string;
}

export const categories = [
  "À la Une",
  "Politique",
  "Économie",
  "Développement",
  "Écologie",
  "Éducation",
  "Diplomatie",
  "En province",
  "Sport",
  "Société",
];

export const articles: Article[] = [
  {
    id: "1",
    title: "Sommet de Kinshasa : les dirigeants africains s'engagent pour la paix dans l'Est du Congo",
    summary: "Les chefs d'État de la SADC ont réaffirmé leur engagement pour le retour à la paix dans la région des Grands Lacs lors d'un sommet historique.",
    image: article2,
    category: "Politique",
    timeAgo: "Il y a 12 min",
    author: "Jean-Pierre Mukendi",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "2",
    title: "L'économie congolaise en pleine croissance : les investissements étrangers augmentent de 25%",
    summary: "Le ministère des Finances annonce une hausse significative des investissements directs étrangers au premier trimestre 2026.",
    image: article4,
    category: "Économie",
    timeAgo: "Il y a 28 min",
    author: "Marie Kabila",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: "3",
    title: "Les Léopards remportent une victoire éclatante en éliminatoires de la CAN 2027",
    summary: "L'équipe nationale a dominé le match avec un score de 3-0, galvanisant les supporters à travers le pays.",
    image: article3,
    category: "Sport",
    timeAgo: "Il y a 55 min",
    author: "Patrick Lumumba",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: "4",
    title: "Un programme éducatif révolutionnaire lancé dans 5 provinces de la RDC",
    summary: "Le gouvernement investit massivement dans l'éducation numérique pour les zones rurales avec un partenariat international.",
    image: article5,
    category: "Éducation",
    timeAgo: "Il y a 1h",
    author: "Sarah Tshisekedi",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: "5",
    title: "Alerte météo : de fortes pluies attendues sur Kinshasa cette semaine",
    summary: "Les autorités appellent à la vigilance face aux risques d'inondations dans plusieurs communes de la capitale.",
    image: article1,
    category: "Société",
    timeAgo: "Il y a 2h",
    author: "Claude Mwamba",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

export const books: Book[] = [
  {
    id: "1",
    title: "Histoire du Congo : De Léopold II à nos jours",
    author: "Prof. Isidore Ndaywel",
    cover: "📘",
    price: "12.99$",
    category: "Histoire",
    rating: 4.8,
    description: "Un ouvrage de référence sur l'histoire complète de la RDC.",
  },
  {
    id: "2",
    title: "L'Afrique qui vient",
    author: "Jean-Michel Mabeko",
    cover: "📗",
    price: "9.99$",
    category: "Politique",
    rating: 4.5,
    description: "Vision prospective du continent africain au 21e siècle.",
  },
  {
    id: "3",
    title: "Économie congolaise : défis et opportunités",
    author: "Dr. Patience Mukeba",
    cover: "📙",
    price: "15.99$",
    category: "Économie",
    rating: 4.3,
    description: "Analyse approfondie du potentiel économique de la RDC.",
  },
  {
    id: "4",
    title: "Contes et légendes du bassin du Congo",
    author: "Marie-Claire Faray",
    cover: "📕",
    price: "7.99$",
    category: "Culture",
    rating: 4.9,
    description: "Recueil des plus beaux contes traditionnels congolais.",
  },
];

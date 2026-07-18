import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Trophy,
  Users,
  ShieldCheck,
  Clapperboard,
  PackagePlus,
  Target,
  Compass,
  FileText,
  PenTool,
  MessageSquareText,
  Gauge,
  Truck,
  Brain,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  status: "live" | "beta" | "soon";
  description: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Vue d'ensemble",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        status: "live",
        description: "Vue globale de votre activité e-commerce.",
      },
    ],
  },
  {
    title: "Recherche produit",
    items: [
      {
        label: "Winner Finder",
        href: "/dashboard/winner-finder",
        icon: Trophy,
        status: "live",
        description: "Trouvez les produits gagnants avant les autres.",
      },
      {
        label: "Product Validator",
        href: "/dashboard/product-validator",
        icon: ShieldCheck,
        status: "beta",
        description: "Validez un produit avant de dépenser en publicité.",
      },
      {
        label: "Market Opportunity",
        href: "/dashboard/market-opportunity",
        icon: Gauge,
        status: "beta",
        description: "Score d'opportunité par pays.",
      },
      {
        label: "Saturation Detector",
        href: "/dashboard/saturation-detector",
        icon: Gauge,
        status: "beta",
        description: "Évitez les produits trop tard sur le marché.",
      },
    ],
  },
  {
    title: "Intelligence concurrentielle",
    items: [
      {
        label: "Competitor Analyzer",
        href: "/dashboard/competitor-analyzer",
        icon: Users,
        status: "live",
        description: "Analysez la stratégie de vos concurrents.",
      },
      {
        label: "Angle Finder",
        href: "/dashboard/angle-finder",
        icon: Compass,
        status: "beta",
        description: "Découvrez les meilleurs angles marketing.",
      },
      {
        label: "Comment Analyzer",
        href: "/dashboard/comment-analyzer",
        icon: MessageSquareText,
        status: "beta",
        description: "Extrayez objections et désirs des commentaires.",
      },
    ],
  },
  {
    title: "Création",
    items: [
      {
        label: "Creative Analyzer",
        href: "/dashboard/creative-analyzer",
        icon: Clapperboard,
        status: "beta",
        description: "Analysez vos publicités image ou vidéo.",
      },
      {
        label: "Script Generator",
        href: "/dashboard/script-generator",
        icon: FileText,
        status: "beta",
        description: "Générez des scripts vidéo à haute conversion.",
      },
      {
        label: "Copywriter",
        href: "/dashboard/copywriter",
        icon: PenTool,
        status: "beta",
        description: "Textes publicitaires prêts à l'emploi.",
      },
      {
        label: "Offer Builder",
        href: "/dashboard/offer-builder",
        icon: PackagePlus,
        status: "beta",
        description: "Construisez l'offre qui maximise les conversions.",
      },
    ],
  },
  {
    title: "Croissance",
    items: [
      {
        label: "Audience Finder",
        href: "/dashboard/audience-finder",
        icon: Target,
        status: "beta",
        description: "Trouvez vos meilleures audiences Facebook.",
      },
      {
        label: "WhatsApp Assistant",
        href: "/dashboard/whatsapp-assistant",
        icon: MessageSquareText,
        status: "beta",
        description: "Convertissez plus de prospects sur WhatsApp.",
      },
      {
        label: "Supplier Finder",
        href: "/dashboard/supplier-finder",
        icon: Truck,
        status: "beta",
        description: "Trouvez vos meilleurs fournisseurs.",
      },
      {
        label: "Ecommerce Brain",
        href: "/dashboard/ecommerce-brain",
        icon: Brain,
        status: "beta",
        description: "La mémoire IA de votre activité.",
      },
    ],
  },
  {
    title: "Compte",
    items: [
      {
        label: "Paramètres",
        href: "/dashboard/settings",
        icon: Settings,
        status: "live",
        description: "Clés API, préférences, équipe.",
      },
    ],
  },
];

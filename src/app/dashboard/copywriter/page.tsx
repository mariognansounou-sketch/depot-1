import type { Metadata } from "next";
import { PenTool } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "AI Copywriter E-commerce" };

export default function CopywriterPage() {
  return (
    <ComingSoon
      icon={PenTool}
      title="AI Copywriter E-commerce"
      moduleLabel="Module 9"
      description="Générez automatiquement tous les textes nécessaires pour vendre : Facebook Ads, WhatsApp, Shopify, TikTok."
      roadmap={[
        "Texte Facebook Ads (titre, texte, description, CTA)",
        "Messages WhatsApp Business (accueil, relance, fermeture)",
        "Fiche produit Shopify (bénéfices, FAQ, objections, garanties)",
        "Description et hashtags TikTok",
        "Modèle de données CopyAsset déjà en place",
      ]}
    />
  );
}

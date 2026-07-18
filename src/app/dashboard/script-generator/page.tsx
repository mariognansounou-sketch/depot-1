import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "AI Script Generator" };

export default function ScriptGeneratorPage() {
  return (
    <ComingSoon
      icon={FileText}
      title="AI Script Generator"
      moduleLabel="Module 8"
      description="Générez des scripts vidéo à haute conversion pour Facebook, Instagram, TikTok et WhatsApp Status."
      roadmap={[
        "Script UGC (face caméra)",
        "Script storytelling (avant / découverte / après)",
        "Script démonstration produit",
        "Versions émotionnelle, rationnelle, agressive, courte, longue",
        "Réutilise le moteur d'analyse d'angle déjà construit (Module 2 & 3)",
        "Modèle de données ScriptAsset déjà en place",
      ]}
    />
  );
}

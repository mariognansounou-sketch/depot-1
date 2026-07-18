import type { Metadata } from "next";
import { Clapperboard } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "AI Creative Analyzer" };

export default function CreativeAnalyzerPage() {
  return (
    <ComingSoon
      icon={Clapperboard}
      title="AI Creative Analyzer"
      moduleLabel="Module 4"
      description="Importez une vidéo ou une image publicitaire et obtenez une analyse complète de son potentiel de performance."
      roadmap={[
        "Score d'attention sur la première seconde",
        "Découpage de la structure narrative",
        "Analyse visuelle (qualité, démonstration, émotion)",
        "Analyse persuasive (preuve sociale, urgence, rareté)",
        "Forces, faiblesses et améliorations concrètes",
        "Modèle de données CreativeAnalysis déjà en place",
      ]}
    />
  );
}

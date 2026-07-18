import type { Metadata } from "next";
import { MessageSquareText } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "AI Comment Analyzer" };

export default function CommentAnalyzerPage() {
  return (
    <ComingSoon
      icon={MessageSquareText}
      title="AI Comment Analyzer"
      moduleLabel="Module 12"
      description="Analysez en masse les commentaires sous vos publicités concurrentes pour en tirer objections, désirs et questions récurrentes."
      roadmap={[
        "Extraction des questions fréquentes",
        "Détection des objections récurrentes",
        "Détection des motivations d'achat",
        "Déjà partiellement disponible dans Competitor Analyzer (analyse par publicité)",
        "Modèle de données CommentAnalysis déjà en place",
      ]}
    />
  );
}

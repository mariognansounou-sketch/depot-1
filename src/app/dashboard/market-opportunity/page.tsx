import type { Metadata } from "next";
import { Gauge } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Market Opportunity Score" };

export default function MarketOpportunityPage() {
  return (
    <ComingSoon
      icon={Gauge}
      title="Market Opportunity Score"
      moduleLabel="Module 6"
      description="Sachez si un produit est une opportunité dans un marché précis avant de vous lancer."
      roadmap={[
        "Score de succès dans des pays similaires",
        "Analyse de la concurrence locale",
        "Adéquation avec le pouvoir d'achat local",
        "Compatibilité culturelle et logistique",
        "Modèle de données MarketOpportunityScore déjà en place",
      ]}
    />
  );
}

import type { Metadata } from "next";
import { Brain } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "AI Personal Ecommerce Brain" };

export default function EcommerceBrainPage() {
  return (
    <ComingSoon
      icon={Brain}
      title="AI Personal Ecommerce Brain"
      moduleLabel="Module 15"
      description="La mémoire IA de votre activité : elle apprend de vos campagnes passées pour personnaliser ses recommandations."
      roadmap={[
        "Historique des produits testés, gagnants et perdants",
        "Mémorisation des créatives et angles utilisés",
        "Insights personnalisés basés sur vos résultats passés",
        "Modèle de données MemoryEntry déjà en place",
      ]}
    />
  );
}

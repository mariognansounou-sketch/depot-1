import type { Metadata } from "next";
import { Gauge } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Saturation Detector" };

export default function SaturationDetectorPage() {
  return (
    <ComingSoon
      icon={Gauge}
      title="Saturation Detector"
      moduleLabel="Module 7"
      description="Évitez de lancer un produit trop tard, une fois le marché déjà saturé."
      roadmap={[
        "Suivi du nombre d'annonceurs dans le temps",
        "Évolution du volume de publicités par produit",
        "Durée moyenne des campagnes concurrentes",
        "Recommandation d'angle alternatif si saturation élevée",
        "Modèle de données SaturationReport déjà en place",
      ]}
    />
  );
}

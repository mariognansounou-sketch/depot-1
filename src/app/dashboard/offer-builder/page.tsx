import type { Metadata } from "next";
import { PackagePlus } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "AI Offer Builder" };

export default function OfferBuilderPage() {
  return (
    <ComingSoon
      icon={PackagePlus}
      title="AI Offer Builder"
      moduleLabel="Module 10"
      description="Construisez l'offre commerciale qui maximise vos conversions : prix, bonus, garanties, urgence."
      roadmap={[
        "Prix conseillé avec justification",
        "Bonus et packs suggérés",
        "Garanties (satisfaction, qualité, remplacement)",
        "Mécanismes d'urgence et de rareté",
        "Modèle de données Offer déjà en place",
      ]}
    />
  );
}

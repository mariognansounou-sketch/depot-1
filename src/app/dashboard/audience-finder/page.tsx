import type { Metadata } from "next";
import { Target } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "AI Audience Finder" };

export default function AudienceFinderPage() {
  return (
    <ComingSoon
      icon={Target}
      title="AI Audience Finder"
      moduleLabel="Module 11"
      description="Trouvez automatiquement vos meilleures audiences Facebook Ads : client idéal, démographie, intérêts."
      roadmap={[
        "Profil du client idéal",
        "Démographie estimée (âge, sexe, profession, pouvoir d'achat)",
        "Motivations d'achat",
        "Suggestions d'intérêts et de comportements Facebook",
        "Modèle de données AudienceProfile déjà en place",
      ]}
    />
  );
}

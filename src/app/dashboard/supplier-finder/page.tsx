import type { Metadata } from "next";
import { Truck } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "AI Supplier Finder" };

export default function SupplierFinderPage() {
  return (
    <ComingSoon
      icon={Truck}
      title="AI Supplier Finder"
      moduleLabel="Module 14"
      description="Trouvez rapidement vos meilleures sources d'approvisionnement et comparez les fournisseurs."
      roadmap={[
        "Comparateur AliExpress / Alibaba / CJ Dropshipping",
        "Comparaison prix, délais, avis, quantité minimum",
        "Modèle de données Supplier déjà en place",
      ]}
    />
  );
}

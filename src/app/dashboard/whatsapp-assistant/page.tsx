import type { Metadata } from "next";
import { MessageSquareText } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "AI WhatsApp Sales Assistant" };

export default function WhatsAppAssistantPage() {
  return (
    <ComingSoon
      icon={MessageSquareText}
      title="AI WhatsApp Sales Assistant"
      moduleLabel="Module 13"
      description="Convertissez plus de prospects sur WhatsApp grâce à la détection d'intention et aux réponses suggérées par l'IA."
      roadmap={[
        "Classification des prospects (chaud, hésitant, froid)",
        "Détection automatique des objections",
        "Réponses suggérées et relances automatiques",
        "Modèle de données WhatsAppConversation déjà en place",
      ]}
    />
  );
}

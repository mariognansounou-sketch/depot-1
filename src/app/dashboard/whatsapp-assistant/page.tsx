import type { Metadata } from "next";
import { WhatsAppAssistantApp } from "@/modules/whatsapp-assistant/components/whatsapp-assistant-app";

export const metadata: Metadata = { title: "AI WhatsApp Sales Assistant" };

export default function WhatsAppAssistantPage() {
  return <WhatsAppAssistantApp />;
}

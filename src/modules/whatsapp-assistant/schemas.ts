import { z } from "zod";

export const whatsappAssistantSchema = z.object({
  prospectStatus: z.enum(["HOT", "WARM", "HESITANT", "COLD"]),
  statusReasoning: z.string().describe("Pourquoi ce prospect est classé ainsi, en français"),
  detectedObjections: z.array(z.string()).max(8),
  purchaseIntentSignals: z.array(z.string()).max(8),
  suggestedReply: z.string().describe("La réponse idéale à envoyer maintenant, en français"),
  followUpMessages: z.array(z.string()).min(1).max(4),
  quickReplies: z.array(z.string()).min(2).max(8),
});
export type WhatsAppAssistantResult = z.infer<typeof whatsappAssistantSchema>;

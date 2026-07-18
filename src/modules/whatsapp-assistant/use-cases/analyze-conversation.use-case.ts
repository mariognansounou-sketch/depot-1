import type { AIPort } from "@/core/ports/ai.port";
import { prisma } from "@/infrastructure/db/prisma";
import { ValidationError } from "@/core/errors";
import { whatsappAssistantSchema } from "../schemas";
import { buildWhatsAppAnalysisPrompt, WHATSAPP_ASSISTANT_SYSTEM_PROMPT } from "../prompts";

export interface ConversationMessage {
  from: "client" | "vendeur";
  text: string;
}

export class AnalyzeWhatsAppConversationUseCase {
  constructor(private readonly ai: AIPort) {}

  async execute(args: {
    userId: string;
    contactName?: string;
    productContext?: string;
    messages: ConversationMessage[];
  }) {
    if (args.messages.length === 0) {
      throw new ValidationError("La conversation est vide.");
    }

    const conversationText = args.messages
      .map((m) => `${m.from === "client" ? "Client" : "Vendeur"} : ${m.text}`)
      .join("\n");

    const result = await this.ai.generateStructured({
      system: WHATSAPP_ASSISTANT_SYSTEM_PROMPT,
      prompt: buildWhatsAppAnalysisPrompt({ productContext: args.productContext, conversation: conversationText }),
      schema: whatsappAssistantSchema,
      maxTokens: 2048,
    });

    const saved = await prisma.whatsAppConversation.create({
      data: {
        userId: args.userId,
        contactName: args.contactName,
        messages: args.messages as unknown as object,
        prospectStatus: result.prospectStatus,
        detectedObjections: result.detectedObjections,
        suggestedReplies: {
          suggestedReply: result.suggestedReply,
          followUpMessages: result.followUpMessages,
          quickReplies: result.quickReplies,
        },
      },
    });

    await prisma.searchHistory.create({
      data: {
        userId: args.userId,
        module: "whatsapp-assistant",
        query: { contactName: args.contactName } as unknown as object,
        resultSummary: `Prospect ${result.prospectStatus} détecté${args.contactName ? ` — ${args.contactName}` : ""}`,
      },
    });

    return { id: saved.id, result };
  }
}

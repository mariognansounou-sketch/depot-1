import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/modules/auth/auth";
import { AnalyzeWhatsAppConversationUseCase } from "@/modules/whatsapp-assistant/use-cases/analyze-conversation.use-case";
import { getAIProvider } from "@/infrastructure/ai/anthropic-ai-provider";
import { DomainError } from "@/core/errors";
import { logger } from "@/infrastructure/logging/logger";

const schema = z.object({
  contactName: z.string().max(80).optional(),
  productContext: z.string().max(300).optional(),
  messages: z
    .array(z.object({ from: z.enum(["client", "vendeur"]), text: z.string().max(1000) }))
    .min(1)
    .max(100),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide", issues: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const useCase = new AnalyzeWhatsAppConversationUseCase(getAIProvider());
    const result = await useCase.execute({ userId: session.user.id, ...parsed.data });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.httpStatus });
    }
    logger.error("WhatsApp assistant analysis failed", { error: String(error) });
    return NextResponse.json({ error: "Une erreur inattendue est survenue" }, { status: 500 });
  }
}

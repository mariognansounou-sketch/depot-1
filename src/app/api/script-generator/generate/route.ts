import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/modules/auth/auth";
import { GenerateScriptUseCase } from "@/modules/script-generator/use-cases/generate-script.use-case";
import { getAIProvider } from "@/infrastructure/ai/anthropic-ai-provider";
import { DomainError } from "@/core/errors";
import { logger } from "@/infrastructure/logging/logger";

const schema = z.object({
  productId: z.string().cuid(),
  type: z.enum(["UGC", "STORYTELLING", "DEMO"]),
  tone: z.enum(["EMOTIONAL", "RATIONAL", "AGGRESSIVE", "SHORT", "LONG"]),
  platform: z.enum(["FACEBOOK", "INSTAGRAM", "TIKTOK", "WHATSAPP"]),
  targetClient: z.string().max(200).optional(),
  angle: z.string().max(200).optional(),
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
    const useCase = new GenerateScriptUseCase(getAIProvider());
    const result = await useCase.execute({ userId: session.user.id, ...parsed.data });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.httpStatus });
    }
    logger.error("Script generation failed", { error: String(error) });
    return NextResponse.json({ error: "Une erreur inattendue est survenue" }, { status: 500 });
  }
}

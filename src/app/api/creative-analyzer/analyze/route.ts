import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/modules/auth/auth";
import { AnalyzeCreativeUseCase } from "@/modules/creative-analyzer/use-cases/analyze-creative.use-case";
import { getAIProvider } from "@/infrastructure/ai/anthropic-ai-provider";
import { DomainError } from "@/core/errors";
import { logger } from "@/infrastructure/logging/logger";

const MAX_BASE64_LENGTH = 8_000_000; // ~6MB raw image, keeps payloads reasonable

const schema = z.object({
  sourceType: z.enum(["VIDEO", "IMAGE"]),
  productContext: z.string().max(300).optional(),
  manualDescription: z.string().max(4000).optional(),
  image: z
    .object({
      base64: z.string().max(MAX_BASE64_LENGTH),
      mediaType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
    })
    .optional(),
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
    const useCase = new AnalyzeCreativeUseCase(getAIProvider());
    const result = await useCase.execute({ userId: session.user.id, ...parsed.data });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.httpStatus });
    }
    logger.error("Creative analysis failed", { error: String(error) });
    return NextResponse.json({ error: "Une erreur inattendue est survenue" }, { status: 500 });
  }
}

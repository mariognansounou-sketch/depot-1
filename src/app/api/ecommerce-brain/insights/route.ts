import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { GenerateBrainInsightsUseCase } from "@/modules/ecommerce-brain/use-cases/generate-insights.use-case";
import { getAIProvider } from "@/infrastructure/ai/anthropic-ai-provider";
import { DomainError } from "@/core/errors";
import { logger } from "@/infrastructure/logging/logger";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  try {
    const useCase = new GenerateBrainInsightsUseCase(getAIProvider());
    const result = await useCase.execute(session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.httpStatus });
    }
    logger.error("Ecommerce brain insight generation failed", { error: String(error) });
    return NextResponse.json({ error: "Une erreur inattendue est survenue" }, { status: 500 });
  }
}

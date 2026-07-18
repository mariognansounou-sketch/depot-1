import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { competitorAnalysisRequestSchema } from "@/lib/validation/competitor-analyzer.schema";
import { AnalyzeCompetitorUseCase } from "@/modules/competitor-analyzer/use-cases/analyze-competitor.use-case";
import { getAdSource } from "@/infrastructure/ad-sources/ad-source.factory";
import { getAIProvider } from "@/infrastructure/ai/anthropic-ai-provider";
import { DomainError } from "@/core/errors";
import { logger } from "@/infrastructure/logging/logger";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = competitorAnalysisRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide", issues: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const useCase = new AnalyzeCompetitorUseCase(getAdSource(), getAIProvider());
    const results = await useCase.execute(session.user.id, parsed.data);
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.httpStatus });
    }
    logger.error("Competitor analysis failed", { error: String(error) });
    return NextResponse.json({ error: "Une erreur inattendue est survenue" }, { status: 500 });
  }
}

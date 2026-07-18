import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/modules/auth/auth";
import { ScoreMarketOpportunityUseCase } from "@/modules/market-opportunity/use-cases/score-market-opportunity.use-case";
import { getAIProvider } from "@/infrastructure/ai/anthropic-ai-provider";
import { DomainError } from "@/core/errors";
import { logger } from "@/infrastructure/logging/logger";

const schema = z.object({ productId: z.string().cuid(), country: z.string().min(2).max(60) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 422 });
  }

  try {
    const useCase = new ScoreMarketOpportunityUseCase(getAIProvider());
    const result = await useCase.execute({ userId: session.user.id, ...parsed.data });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.httpStatus });
    }
    logger.error("Market opportunity scoring failed", { error: String(error) });
    return NextResponse.json({ error: "Une erreur inattendue est survenue" }, { status: 500 });
  }
}

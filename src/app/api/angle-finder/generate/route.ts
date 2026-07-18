import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { opportunityAnglesSchema as opportunityAnglesRequestSchema } from "@/lib/validation/competitor-analyzer.schema";
import { GenerateOpportunityAnglesUseCase } from "@/modules/competitor-analyzer/use-cases/generate-opportunity-angles.use-case";
import { getAIProvider } from "@/infrastructure/ai/anthropic-ai-provider";
import { DomainError } from "@/core/errors";
import { logger } from "@/infrastructure/logging/logger";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = opportunityAnglesRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide", issues: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const useCase = new GenerateOpportunityAnglesUseCase(getAIProvider());
    const result = await useCase.execute({ userId: session.user.id, productId: parsed.data.productId });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.httpStatus });
    }
    logger.error("Angle generation failed", { error: String(error) });
    return NextResponse.json({ error: "Une erreur inattendue est survenue" }, { status: 500 });
  }
}

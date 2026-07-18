import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/modules/auth/auth";
import { DetectSaturationUseCase } from "@/modules/saturation-detector/use-cases/detect-saturation.use-case";
import { getAdSource } from "@/infrastructure/ad-sources/ad-source.factory";
import { getAIProvider } from "@/infrastructure/ai/anthropic-ai-provider";
import { DomainError } from "@/core/errors";
import { logger } from "@/infrastructure/logging/logger";

const manualSignalsSchema = z.object({
  advertiserCount: z.number().int().min(0),
  storeCount: z.number().int().min(0),
  avgCampaignDurationDays: z.number().int().min(0),
  adGrowthTrend: z.array(z.object({ period: z.string(), count: z.number().int().min(0) })).default([]),
});

const schema = z.object({
  productId: z.string().cuid(),
  searchQuery: z.string().min(2).max(120),
  manualSignals: manualSignalsSchema.optional(),
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
    const useCase = new DetectSaturationUseCase(getAdSource(), getAIProvider());
    const result = await useCase.execute({ userId: session.user.id, ...parsed.data });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.httpStatus });
    }
    logger.error("Saturation detection failed", { error: String(error) });
    return NextResponse.json({ error: "Une erreur inattendue est survenue" }, { status: 500 });
  }
}

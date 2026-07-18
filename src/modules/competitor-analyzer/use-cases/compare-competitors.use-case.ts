import type { AIPort } from "@/core/ports/ai.port";
import { prisma } from "@/infrastructure/db/prisma";
import { NotFoundError, ValidationError } from "@/core/errors";
import { competitorComparisonSchema } from "../schemas";
import { buildComparisonPrompt, COMPETITOR_ANALYST_SYSTEM_PROMPT } from "../prompts";

/**
 * Builds the "several competitors side by side" comparator: one row per
 * competitor (angle, strength, weakness) plus a single, clearly
 * articulated opportunity angle none of them are exploiting yet.
 */
export class CompareCompetitorsUseCase {
  constructor(private readonly ai: AIPort) {}

  async execute(args: { userId: string; productId: string; adIds: string[] }) {
    const product = await prisma.product.findFirst({
      where: { id: args.productId, userId: args.userId },
    });
    if (!product) throw new NotFoundError("Produit");

    const ads = await prisma.ad.findMany({
      where: { id: { in: args.adIds } },
      include: { analysis: true, competitor: true },
    });

    const competitors = ads
      .filter((ad) => ad.analysis)
      .map((ad) => {
        const analysis = ad.analysis!;
        const strengths = (analysis.strengths as unknown as string[]) ?? [];
        const weaknesses = (analysis.weaknesses as unknown as string[]) ?? [];
        return {
          label: ad.competitor?.name ?? "Concurrent",
          angle: analysis.angle,
          strength: strengths[0] ?? "Non identifiée",
          weakness: weaknesses[0] ?? "Non identifiée",
        };
      });

    if (competitors.length === 0) {
      throw new ValidationError("Aucune publicité analysée disponible pour construire le comparatif.");
    }

    return this.ai.generateStructured({
      system: COMPETITOR_ANALYST_SYSTEM_PROMPT,
      prompt: buildComparisonPrompt({ productName: product.name, competitors }),
      schema: competitorComparisonSchema,
      maxTokens: 2048,
    });
  }
}

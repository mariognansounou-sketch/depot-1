import type { AIPort } from "@/core/ports/ai.port";
import { prisma } from "@/infrastructure/db/prisma";
import { NotFoundError } from "@/core/errors";
import { marketOpportunitySchema } from "../schemas";
import { buildMarketOpportunityPrompt, MARKET_OPPORTUNITY_SYSTEM_PROMPT } from "../prompts";

export class ScoreMarketOpportunityUseCase {
  constructor(private readonly ai: AIPort) {}

  async execute(args: { userId: string; productId: string; country: string }) {
    const product = await prisma.product.findFirst({
      where: { id: args.productId, userId: args.userId },
    });
    if (!product) throw new NotFoundError("Produit");

    const result = await this.ai.generateStructured({
      system: MARKET_OPPORTUNITY_SYSTEM_PROMPT,
      prompt: buildMarketOpportunityPrompt({
        productName: product.name,
        category: product.category ?? undefined,
        country: args.country,
        priceSale: product.priceSale ?? undefined,
      }),
      schema: marketOpportunitySchema,
      maxTokens: 2048,
    });

    const saved = await prisma.marketOpportunityScore.create({
      data: {
        productId: product.id,
        country: args.country,
        successElsewhereScore: result.successElsewhere.score,
        localCompetitionScore: result.localCompetition.score,
        purchasingPowerScore: result.purchasingPower.score,
        culturalFitScore: result.culturalFit.score,
        logisticsScore: result.logistics.score,
        totalScore: result.totalScore,
        message: result.message,
      },
    });

    await prisma.searchHistory.create({
      data: {
        userId: args.userId,
        module: "market-opportunity",
        query: { productId: product.id, country: args.country } as unknown as object,
        resultSummary: `Score ${result.totalScore}/100 pour "${product.name}" au ${args.country}`,
      },
    });

    return { id: saved.id, result };
  }
}

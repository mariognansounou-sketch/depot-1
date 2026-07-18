import type { AIPort } from "@/core/ports/ai.port";
import { prisma } from "@/infrastructure/db/prisma";
import { NotFoundError } from "@/core/errors";
import { productValidationSchema } from "../schemas";
import { buildProductValidationPrompt, PRODUCT_VALIDATOR_SYSTEM_PROMPT } from "../prompts";

export class ValidateProductUseCase {
  constructor(private readonly ai: AIPort) {}

  async execute(userId: string, productId: string) {
    const product = await prisma.product.findFirst({ where: { id: productId, userId } });
    if (!product) throw new NotFoundError("Produit");

    const result = await this.ai.generateStructured({
      system: PRODUCT_VALIDATOR_SYSTEM_PROMPT,
      prompt: buildProductValidationPrompt({
        name: product.name,
        category: product.category ?? undefined,
        priceCost: product.priceCost ?? undefined,
        priceSale: product.priceSale ?? undefined,
        targetCountry: product.targetCountry ?? undefined,
      }),
      schema: productValidationSchema,
      maxTokens: 2048,
    });

    const saved = await prisma.productValidation.create({
      data: {
        productId: product.id,
        demandScore: result.demandScore.score,
        competitionScore: result.competitionScore.score,
        marginScore: result.marginScore.score,
        logisticsScore: result.logisticsScore.score,
        adPotentialScore: result.adPotentialScore.score,
        totalScore: result.totalScore,
        decision: result.decision,
        reasoning: [
          result.reasoning,
          `Demande: ${result.demandScore.reasoning}`,
          `Concurrence: ${result.competitionScore.reasoning}`,
          `Marge: ${result.marginScore.reasoning}`,
          `Logistique: ${result.logisticsScore.reasoning}`,
          `Potentiel publicitaire: ${result.adPotentialScore.reasoning}`,
        ].join("\n\n"),
      },
    });

    await prisma.searchHistory.create({
      data: {
        userId,
        module: "product-validator",
        query: { productId } as unknown as object,
        resultSummary: `Score ${result.totalScore}/100 — ${result.decision} pour "${product.name}"`,
      },
    });

    return { id: saved.id, result };
  }
}

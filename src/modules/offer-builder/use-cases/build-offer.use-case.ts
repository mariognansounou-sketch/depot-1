import type { AIPort } from "@/core/ports/ai.port";
import { prisma } from "@/infrastructure/db/prisma";
import { NotFoundError } from "@/core/errors";
import { offerSchema } from "../schemas";
import { buildOfferPrompt, OFFER_BUILDER_SYSTEM_PROMPT } from "../prompts";

export class BuildOfferUseCase {
  constructor(private readonly ai: AIPort) {}

  async execute(userId: string, productId: string) {
    const product = await prisma.product.findFirst({ where: { id: productId, userId } });
    if (!product) throw new NotFoundError("Produit");

    const result = await this.ai.generateStructured({
      system: OFFER_BUILDER_SYSTEM_PROMPT,
      prompt: buildOfferPrompt({
        productName: product.name,
        priceCost: product.priceCost ?? undefined,
        priceSale: product.priceSale ?? undefined,
        targetCountry: product.targetCountry ?? undefined,
      }),
      schema: offerSchema,
      maxTokens: 2048,
    });

    const saved = await prisma.offer.create({
      data: {
        productId: product.id,
        recommendedPrice: result.recommendedPrice.value,
        reasoning: result.recommendedPrice.reasoning,
        bonuses: result.bonuses,
        guarantees: result.guarantees,
        urgency: result.urgency,
        packs: result.packs,
        socialProof: result.socialProof,
      },
    });

    await prisma.searchHistory.create({
      data: {
        userId,
        module: "offer-builder",
        query: { productId } as unknown as object,
        resultSummary: `Offre générée pour "${product.name}"`,
      },
    });

    return { id: saved.id, result };
  }
}

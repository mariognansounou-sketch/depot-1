import type { AIPort } from "@/core/ports/ai.port";
import { prisma } from "@/infrastructure/db/prisma";
import { NotFoundError } from "@/core/errors";
import { audienceProfileSchema } from "../schemas";
import { AUDIENCE_FINDER_SYSTEM_PROMPT, buildAudienceFinderPrompt } from "../prompts";

export class FindAudienceUseCase {
  constructor(private readonly ai: AIPort) {}

  async execute(userId: string, productId: string) {
    const product = await prisma.product.findFirst({ where: { id: productId, userId } });
    if (!product) throw new NotFoundError("Produit");

    const result = await this.ai.generateStructured({
      system: AUDIENCE_FINDER_SYSTEM_PROMPT,
      prompt: buildAudienceFinderPrompt({
        productName: product.name,
        category: product.category ?? undefined,
        targetCountry: product.targetCountry ?? undefined,
      }),
      schema: audienceProfileSchema,
      maxTokens: 2048,
    });

    const saved = await prisma.audienceProfile.create({
      data: {
        productId: product.id,
        idealClient: result.idealClient,
        demographics: result.demographics,
        motivations: result.motivations,
        interests: result.interests,
        behaviors: result.behaviors,
        lookalikeNotes: result.lookalikeNotes,
      },
    });

    await prisma.searchHistory.create({
      data: {
        userId,
        module: "audience-finder",
        query: { productId } as unknown as object,
        resultSummary: `Audience générée pour "${product.name}"`,
      },
    });

    return { id: saved.id, result };
  }
}

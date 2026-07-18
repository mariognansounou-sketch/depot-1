import type { AIPort } from "@/core/ports/ai.port";
import { prisma } from "@/infrastructure/db/prisma";
import { NotFoundError, ValidationError } from "@/core/errors";
import { strategySchema, type AdAnalysisResult } from "../schemas";
import { buildStrategyPrompt, COMPETITOR_ANALYST_SYSTEM_PROMPT } from "../prompts";

/**
 * Turns one or more analyzed competitor ads into a differentiated
 * strategy: new positioning, new hooks, a full video script and ad copy —
 * explicitly instructed (see prompts.ts) never to copy the competitors.
 */
export class GenerateStrategyUseCase {
  constructor(private readonly ai: AIPort) {}

  async execute(args: {
    userId: string;
    productId: string;
    adIds: string[];
    targetCountry?: string;
  }) {
    const product = await prisma.product.findFirst({
      where: { id: args.productId, userId: args.userId },
    });
    if (!product) throw new NotFoundError("Produit");

    const ads = await prisma.ad.findMany({
      where: { id: { in: args.adIds } },
      include: { analysis: true, competitor: true },
    });
    if (ads.length === 0) {
      throw new ValidationError("Aucune publicité analysée n'a été fournie pour générer une stratégie.");
    }

    const analyses = ads
      .filter((ad) => ad.analysis)
      .map((ad) => {
        const analysis = ad.analysis!;
        const weaknesses = (analysis.weaknesses as unknown as string[]) ?? [];
        return {
          competitorLabel: ad.competitor?.name ?? "Concurrent",
          angle: analysis.angle,
          hook: analysis.hookText ?? "",
          emotion: analysis.emotion,
          targetAudience: JSON.stringify(analysis.targetAudience),
          weaknesses,
        };
      });

    const strategy = await this.ai.generateStructured({
      system: COMPETITOR_ANALYST_SYSTEM_PROMPT,
      prompt: buildStrategyPrompt({
        productName: product.name,
        targetCountry: args.targetCountry ?? product.targetCountry ?? undefined,
        analyses,
      }),
      schema: strategySchema,
      maxTokens: 4096,
    });

    const saved = await prisma.strategy.create({
      data: {
        productId: product.id,
        positioning: `${strategy.positioning.old} → ${strategy.positioning.new}`,
        hooks: strategy.hooks,
        videoScript: strategy.videoScript,
        adCopy: strategy.adCopy,
        basedOnAdIds: args.adIds,
      },
    });

    return { id: saved.id, strategy };
  }
}

export type { AdAnalysisResult };

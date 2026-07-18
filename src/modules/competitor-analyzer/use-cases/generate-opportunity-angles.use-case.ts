import type { AIPort } from "@/core/ports/ai.port";
import { prisma } from "@/infrastructure/db/prisma";
import { NotFoundError } from "@/core/errors";
import { opportunityAnglesSchema } from "../schemas";
import { buildOpportunityAnglesPrompt, COMPETITOR_ANALYST_SYSTEM_PROMPT } from "../prompts";

/**
 * Module 3 — AI Angle Marketing Finder. Also used by Module 2's
 * "détection des opportunités marketing" step: feed it the angles already
 * observed in competitor ads (optional) and it returns a full 20-50 angle
 * library classified by category, flagging which ones are already used.
 */
export class GenerateOpportunityAnglesUseCase {
  constructor(private readonly ai: AIPort) {}

  async execute(args: {
    userId: string;
    productId: string;
    usedAngles?: { competitorLabel: string; angle: string; category: string }[];
  }) {
    const product = await prisma.product.findFirst({
      where: { id: args.productId, userId: args.userId },
    });
    if (!product) throw new NotFoundError("Produit");

    let usedAngles = args.usedAngles;
    if (!usedAngles) {
      const analyses = await prisma.adAnalysis.findMany({
        where: { ad: { productId: product.id } },
        include: { ad: { include: { competitor: true } } },
        take: 10,
      });
      usedAngles = analyses.map((a) => ({
        competitorLabel: a.ad.competitor?.name ?? "Concurrent",
        angle: a.angle,
        category: a.angleCategory,
      }));
    }

    const result = await this.ai.generateStructured({
      system: COMPETITOR_ANALYST_SYSTEM_PROMPT,
      prompt: buildOpportunityAnglesPrompt({ productName: product.name, usedAngles }),
      schema: opportunityAnglesSchema,
      maxTokens: 8192,
    });

    await prisma.$transaction(
      result.angles.map((angle) =>
        prisma.marketingAngle.create({
          data: {
            productId: product.id,
            name: angle.name,
            category: angle.category,
            description: angle.description,
            whyItWorks: angle.whyItWorks,
            targetClient: angle.targetClient,
            strengthScore: angle.strengthScore,
            competitionLevel: angle.competitionLevel,
            opportunityScore: angle.opportunityScore,
            isUsedByCompetitor: angle.isUsedByCompetitor,
          },
        }),
      ),
    );

    await prisma.searchHistory.create({
      data: {
        userId: args.userId,
        module: "angle-finder",
        query: { productId: product.id } as unknown as object,
        resultSummary: `${result.angles.length} angles générés pour "${product.name}"`,
      },
    });

    return result;
  }
}

import type { AIPort } from "@/core/ports/ai.port";
import type { AdSourcePort } from "@/core/ports/ad-source.port";
import { prisma } from "@/infrastructure/db/prisma";
import { NotFoundError, ValidationError } from "@/core/errors";
import { saturationInterpretationSchema } from "../schemas";
import { buildSaturationPrompt, SATURATION_DETECTOR_SYSTEM_PROMPT } from "../prompts";
import { computeSaturationSignals, type SaturationSignals } from "../signals";

export class DetectSaturationUseCase {
  constructor(
    private readonly adSource: AdSourcePort,
    private readonly ai: AIPort,
  ) {}

  async execute(args: {
    userId: string;
    productId: string;
    searchQuery: string;
    manualSignals?: SaturationSignals;
  }) {
    const product = await prisma.product.findFirst({
      where: { id: args.productId, userId: args.userId },
    });
    if (!product) throw new NotFoundError("Produit");

    let signals = args.manualSignals;
    if (!signals) {
      const ads = await this.adSource.searchAds({ query: args.searchQuery, limit: 50 });
      if (ads.length === 0) {
        throw new ValidationError(
          "Aucune publicité trouvée via la Meta Ad Library API pour estimer la saturation. Configurez l'accès API ou renseignez les signaux manuellement (nombre d'annonceurs, boutiques, durée moyenne).",
        );
      }
      signals = computeSaturationSignals(ads);
    }

    const interpretation = await this.ai.generateStructured({
      system: SATURATION_DETECTOR_SYSTEM_PROMPT,
      prompt: buildSaturationPrompt({ productName: product.name, signals }),
      schema: saturationInterpretationSchema,
      maxTokens: 1024,
    });

    const saved = await prisma.saturationReport.create({
      data: {
        productId: product.id,
        advertiserCount: signals.advertiserCount,
        adGrowthTrend: signals.adGrowthTrend,
        avgCampaignDuration: signals.avgCampaignDurationDays,
        storeCount: signals.storeCount,
        saturationLevel: interpretation.saturationLevel,
        saturationPercent: interpretation.saturationPercent,
        recommendation: `${interpretation.recommendation}\n\n${interpretation.reasoning}`,
      },
    });

    await prisma.searchHistory.create({
      data: {
        userId: args.userId,
        module: "saturation-detector",
        query: { productId: product.id, searchQuery: args.searchQuery } as unknown as object,
        resultSummary: `Saturation ${interpretation.saturationLevel} (${interpretation.saturationPercent}%) pour "${product.name}"`,
      },
    });

    return { id: saved.id, signals, interpretation };
  }
}

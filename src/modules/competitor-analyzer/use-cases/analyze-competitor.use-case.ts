import type { AdSourcePort, RawAdRecord } from "@/core/ports/ad-source.port";
import type { AIPort } from "@/core/ports/ai.port";
import { prisma } from "@/infrastructure/db/prisma";
import { ManualAdInputSource } from "@/infrastructure/ad-sources/manual-ad-input-source";
import { ValidationError } from "@/core/errors";
import { adAnalysisSchema, commentAnalysisSchema } from "../schemas";
import { buildAdAnalysisPrompt, buildCommentAnalysisPrompt, COMPETITOR_ANALYST_SYSTEM_PROMPT } from "../prompts";
import type { CompetitorAnalysisRequest } from "../types";

export interface AnalyzedAd {
  adId: string;
  competitorLabel: string;
  ad: RawAdRecord;
  analysis: import("../schemas").AdAnalysisResult;
  comments?: import("../schemas").CommentAnalysisResult;
}

/**
 * Orchestrates Module 2 — Competitor Intelligence AI.
 *
 * Resolves the four supported input modes (ad link, product name, store
 * URL, brand name) into one or more RawAdRecord, runs each through the AI
 * analysis pipeline (hook, structure, angle, emotion, audience, scoring),
 * and persists everything so it feeds the Strategy Generator, the
 * Comparator, and the user's SearchHistory / MemoryEntry over time.
 */
export class AnalyzeCompetitorUseCase {
  constructor(
    private readonly adSource: AdSourcePort,
    private readonly ai: AIPort,
  ) {}

  async execute(userId: string, request: CompetitorAnalysisRequest): Promise<AnalyzedAd[]> {
    const rawAds = await this.resolveAds(request);
    if (rawAds.length === 0) {
      throw new ValidationError(
        "Aucune publicité n'a pu être résolue à partir de cette entrée. Essayez de coller les données manuellement.",
      );
    }

    const competitorLabel =
      request.manualAd?.pageName || rawAds[0]?.pageName || request.value?.slice(0, 60) || "Concurrent";

    const competitor =
      (await prisma.competitor.findFirst({ where: { userId, name: competitorLabel } })) ??
      (await prisma.competitor.create({ data: { userId, name: competitorLabel } }));

    const results: AnalyzedAd[] = [];

    for (const rawAd of rawAds) {
      const analysis = await this.ai.generateStructured({
        system: COMPETITOR_ANALYST_SYSTEM_PROMPT,
        prompt: buildAdAnalysisPrompt(rawAd, request.manualAd?.comments),
        schema: adAnalysisSchema,
        maxTokens: 4096,
      });

      const savedAd = await prisma.ad.create({
        data: {
          competitorId: competitor.id,
          productId: request.productId,
          sourceArchiveId: rawAd.sourceArchiveId,
          sourceUrl: rawAd.sourceUrl,
          ingestMethod: request.mode === "AD_URL" && request.manualAd ? "MANUAL" : "META_AD_LIBRARY_API",
          mediaType: rawAd.mediaType ?? "UNKNOWN",
          mediaUrl: rawAd.mediaUrl,
          headline: rawAd.headline,
          primaryText: rawAd.primaryText,
          description: rawAd.description,
          cta: rawAd.cta,
          countries: rawAd.countries ?? [],
          languages: rawAd.languages ?? [],
          startDate: rawAd.startDate ? new Date(rawAd.startDate) : undefined,
          endDate: rawAd.endDate ? new Date(rawAd.endDate) : undefined,
          isActive: rawAd.isActive ?? true,
          variantsCount: rawAd.variantsCount ?? 1,
          rawPayload: (rawAd.raw as object) ?? {},
        },
      });

      await prisma.adAnalysis.create({
        data: {
          adId: savedAd.id,
          hookText: analysis.hook.text,
          hookScore: analysis.hook.score,
          hookReasoning: analysis.hook.reasoning,
          structure: analysis.structure,
          angle: analysis.angle.name,
          angleCategory: analysis.angle.category,
          emotion: analysis.emotion.primary,
          emotionReasoning: analysis.emotion.reasoning,
          targetAudience: analysis.targetAudience,
          promises: analysis.promises,
          benefits: analysis.benefits,
          objectionsHandled: analysis.objectionsHandled,
          performanceScore: analysis.performanceScore,
          scoreBreakdown: analysis.scoreBreakdown,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          improvements: analysis.improvements,
        },
      });

      let comments: import("../schemas").CommentAnalysisResult | undefined;
      if (request.manualAd?.comments?.length) {
        comments = await this.ai.generateStructured({
          system: COMPETITOR_ANALYST_SYSTEM_PROMPT,
          prompt: buildCommentAnalysisPrompt(request.manualAd.comments),
          schema: commentAnalysisSchema,
          maxTokens: 1024,
        });
        await prisma.commentAnalysis.create({
          data: {
            adId: savedAd.id,
            questions: comments.questions,
            objections: comments.objections,
            motivations: comments.motivations,
          },
        });
      }

      results.push({ adId: savedAd.id, competitorLabel, ad: rawAd, analysis, comments });
    }

    await prisma.searchHistory.create({
      data: {
        userId,
        module: "competitor-analyzer",
        query: request as unknown as object,
        resultSummary: `${results.length} publicité(s) analysée(s) pour "${competitorLabel}"`,
      },
    });

    return results;
  }

  private async resolveAds(request: CompetitorAnalysisRequest): Promise<RawAdRecord[]> {
    if (request.manualAd) {
      const manualSource = new ManualAdInputSource();
      return [manualSource.normalize(request.manualAd)];
    }

    const value = request.value?.trim();
    if (!value) {
      throw new ValidationError("Renseignez une valeur de recherche ou les données manuelles de la publicité.");
    }

    if (request.mode === "AD_URL") {
      const ad = await this.adSource.getAdByUrlOrId(value);
      return ad ? [ad] : [];
    }

    // PRODUCT_NAME, BRAND_NAME, STORE_URL all resolve through a free-text
    // search against the ad source (Meta Ad Library API when configured).
    return this.adSource.searchAds({ query: value, limit: 5 });
  }
}

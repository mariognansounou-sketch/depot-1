import type { AIPort, ImageInput } from "@/core/ports/ai.port";
import { prisma } from "@/infrastructure/db/prisma";
import { ValidationError } from "@/core/errors";
import { creativeAnalysisSchema } from "../schemas";
import { buildCreativeAnalysisPrompt, CREATIVE_ANALYZER_SYSTEM_PROMPT } from "../prompts";

/**
 * Module 4 — Creative Analyzer.
 *
 * Claude analyzes images natively via vision. Video is not natively
 * supported by the model, so for `sourceType: "VIDEO"` the caller must
 * supply either a key frame image (best effort visual analysis) and/or a
 * manual text description of the video (hook, pacing, scenes) — the same
 * "always-available manual fallback" pattern used by the ad sources
 * (see docs/META_AD_LIBRARY.md). This is documented to the user in the UI,
 * never silently degraded.
 */
export class AnalyzeCreativeUseCase {
  constructor(private readonly ai: AIPort) {}

  async execute(args: {
    userId: string;
    productId?: string;
    sourceType: "VIDEO" | "IMAGE";
    image?: ImageInput;
    manualDescription?: string;
    productContext?: string;
  }) {
    if (!args.image && !args.manualDescription) {
      throw new ValidationError(
        "Fournissez une image (recommandé) ou, pour une vidéo, une description détaillée de son contenu.",
      );
    }

    const result = await this.ai.generateStructured({
      system: CREATIVE_ANALYZER_SYSTEM_PROMPT,
      prompt: buildCreativeAnalysisPrompt({
        productContext: args.productContext,
        manualDescription: args.manualDescription,
      }),
      schema: creativeAnalysisSchema,
      images: args.image ? [args.image] : undefined,
      maxTokens: 3072,
    });

    const saved = await prisma.creativeAnalysis.create({
      data: {
        userId: args.userId,
        productId: args.productId,
        sourceType: args.sourceType,
        mediaUrl: null,
        hookAttentionScore: result.hookAttention.score,
        structure: result.structure,
        visualAnalysis: result.visualAnalysis,
        persuasionAnalysis: result.persuasionAnalysis,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        improvements: result.improvements,
      },
    });

    await prisma.searchHistory.create({
      data: {
        userId: args.userId,
        module: "creative-analyzer",
        query: { sourceType: args.sourceType } as unknown as object,
        resultSummary: `Hook ${result.hookAttention.score}/10 — analyse créative générée`,
      },
    });

    return { id: saved.id, result };
  }
}

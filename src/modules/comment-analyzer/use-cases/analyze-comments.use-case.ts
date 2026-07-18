import type { AIPort } from "@/core/ports/ai.port";
import { prisma } from "@/infrastructure/db/prisma";
import { ValidationError } from "@/core/errors";
import { commentAnalysisSchema } from "@/modules/competitor-analyzer/schemas";
import {
  buildCommentAnalysisPrompt,
  COMPETITOR_ANALYST_SYSTEM_PROMPT,
} from "@/modules/competitor-analyzer/prompts";

/**
 * Module 12 — standalone Comment Analyzer. Reuses the same prompt/schema
 * as the per-ad comment analysis embedded in Module 2, but lets the user
 * paste a batch of comments without going through a full ad analysis
 * first (e.g. comments copied from their own page, not a competitor's ad).
 *
 * `CommentAnalysis` is modeled as 1:1 with an `Ad` row (see schema.prisma)
 * so every comment batch has a consistent home for later cross-referencing
 * with ad performance; a minimal placeholder Ad is created to anchor it.
 */
export class AnalyzeCommentsUseCase {
  constructor(private readonly ai: AIPort) {}

  async execute(args: { userId: string; label: string; comments: string[]; productId?: string }) {
    if (args.comments.length === 0) {
      throw new ValidationError("Aucun commentaire fourni.");
    }

    const result = await this.ai.generateStructured({
      system: COMPETITOR_ANALYST_SYSTEM_PROMPT,
      prompt: buildCommentAnalysisPrompt(args.comments),
      schema: commentAnalysisSchema,
      maxTokens: 1536,
    });

    const placeholderAd = await prisma.ad.create({
      data: {
        productId: args.productId,
        headline: args.label,
        ingestMethod: "MANUAL",
        primaryText: args.comments.join("\n"),
      },
    });

    const saved = await prisma.commentAnalysis.create({
      data: {
        adId: placeholderAd.id,
        questions: result.questions,
        objections: result.objections,
        motivations: result.motivations,
      },
    });

    await prisma.searchHistory.create({
      data: {
        userId: args.userId,
        module: "comment-analyzer",
        query: { label: args.label, count: args.comments.length } as unknown as object,
        resultSummary: `${result.questions.length} questions, ${result.objections.length} objections détectées pour "${args.label}"`,
      },
    });

    return { id: saved.id, result };
  }
}

import type { AIPort } from "@/core/ports/ai.port";
import { prisma } from "@/infrastructure/db/prisma";
import { brainInsightsSchema } from "../schemas";
import { buildBrainInsightsPrompt, ECOMMERCE_BRAIN_SYSTEM_PROMPT } from "../prompts";
import { computeBrainStats, type BrainStats } from "../stats";

export class GenerateBrainInsightsUseCase {
  constructor(private readonly ai: AIPort) {}

  async execute(userId: string): Promise<{ stats: BrainStats; insights: import("../schemas").BrainInsightsResult }> {
    const stats = await computeBrainStats(userId);

    const insights = await this.ai.generateStructured({
      system: ECOMMERCE_BRAIN_SYSTEM_PROMPT,
      prompt: buildBrainInsightsPrompt(stats),
      schema: brainInsightsSchema,
      maxTokens: 1536,
    });

    await prisma.memoryEntry.create({
      data: {
        userId,
        category: "RESULT",
        payload: stats as unknown as object,
        insight: insights.insights.join(" | "),
      },
    });

    return { stats, insights };
  }
}

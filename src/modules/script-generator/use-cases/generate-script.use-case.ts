import type { AIPort } from "@/core/ports/ai.port";
import { prisma } from "@/infrastructure/db/prisma";
import { NotFoundError } from "@/core/errors";
import { scriptResultSchema } from "../schemas";
import { buildScriptPrompt, SCRIPT_GENERATOR_SYSTEM_PROMPT } from "../prompts";

export type ScriptType = "UGC" | "STORYTELLING" | "DEMO";
export type ScriptTone = "EMOTIONAL" | "RATIONAL" | "AGGRESSIVE" | "SHORT" | "LONG";
export type ScriptPlatform = "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "WHATSAPP";

export class GenerateScriptUseCase {
  constructor(private readonly ai: AIPort) {}

  async execute(args: {
    userId: string;
    productId: string;
    type: ScriptType;
    tone: ScriptTone;
    platform: ScriptPlatform;
    targetClient?: string;
    angle?: string;
  }) {
    const product = await prisma.product.findFirst({
      where: { id: args.productId, userId: args.userId },
    });
    if (!product) throw new NotFoundError("Produit");

    const result = await this.ai.generateStructured({
      system: SCRIPT_GENERATOR_SYSTEM_PROMPT,
      prompt: buildScriptPrompt({
        productName: product.name,
        category: product.category ?? undefined,
        price: product.priceSale ?? undefined,
        targetCountry: product.targetCountry ?? undefined,
        targetClient: args.targetClient,
        angle: args.angle,
        type: args.type,
        tone: args.tone,
        platform: args.platform,
      }),
      schema: scriptResultSchema,
      maxTokens: 3072,
    });

    const saved = await prisma.scriptAsset.create({
      data: {
        userId: args.userId,
        productId: product.id,
        type: args.type,
        tone: args.tone,
        platform: args.platform,
        content: result,
      },
    });

    await prisma.searchHistory.create({
      data: {
        userId: args.userId,
        module: "script-generator",
        query: { productId: product.id, type: args.type, tone: args.tone } as unknown as object,
        resultSummary: `Script ${args.type}/${args.tone} généré pour "${product.name}"`,
      },
    });

    return { id: saved.id, result };
  }
}

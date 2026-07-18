import type { AIPort } from "@/core/ports/ai.port";
import { prisma } from "@/infrastructure/db/prisma";
import { NotFoundError, ValidationError } from "@/core/errors";
import {
  facebookAdsCopySchema,
  whatsappCopySchema,
  shopifyCopySchema,
  tiktokCopySchema,
} from "../schemas";
import {
  buildFacebookAdsCopyPrompt,
  buildShopifyCopyPrompt,
  buildTikTokCopyPrompt,
  buildWhatsAppCopyPrompt,
  COPYWRITER_SYSTEM_PROMPT,
} from "../prompts";

export type CopyChannel = "FACEBOOK_ADS" | "WHATSAPP" | "SHOPIFY" | "TIKTOK";

const CHANNEL_CONFIG = {
  FACEBOOK_ADS: { schema: facebookAdsCopySchema, buildPrompt: buildFacebookAdsCopyPrompt },
  WHATSAPP: { schema: whatsappCopySchema, buildPrompt: buildWhatsAppCopyPrompt },
  SHOPIFY: { schema: shopifyCopySchema, buildPrompt: buildShopifyCopyPrompt },
  TIKTOK: { schema: tiktokCopySchema, buildPrompt: buildTikTokCopyPrompt },
} as const;

export class GenerateCopyUseCase {
  constructor(private readonly ai: AIPort) {}

  async execute(args: { userId: string; productId: string; channel: CopyChannel }) {
    const product = await prisma.product.findFirst({
      where: { id: args.productId, userId: args.userId },
    });
    if (!product) throw new NotFoundError("Produit");

    const config = CHANNEL_CONFIG[args.channel];
    if (!config) throw new ValidationError("Canal de copywriting inconnu");

    const result = await this.ai.generateStructured({
      system: COPYWRITER_SYSTEM_PROMPT,
      prompt: config.buildPrompt({
        productName: product.name,
        category: product.category ?? undefined,
        priceSale: product.priceSale ?? undefined,
        targetCountry: product.targetCountry ?? undefined,
      }),
      schema: config.schema,
      maxTokens: 2560,
    });

    const saved = await prisma.copyAsset.create({
      data: {
        userId: args.userId,
        productId: product.id,
        channel: args.channel,
        content: result,
      },
    });

    await prisma.searchHistory.create({
      data: {
        userId: args.userId,
        module: "copywriter",
        query: { productId: product.id, channel: args.channel } as unknown as object,
        resultSummary: `Texte ${args.channel} généré pour "${product.name}"`,
      },
    });

    return { id: saved.id, channel: args.channel, result };
  }
}

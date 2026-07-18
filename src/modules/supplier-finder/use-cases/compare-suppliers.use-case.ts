import type { AIPort } from "@/core/ports/ai.port";
import { prisma } from "@/infrastructure/db/prisma";
import { NotFoundError, ValidationError } from "@/core/errors";
import { supplierRecommendationSchema } from "../schemas";
import { buildSupplierComparisonPrompt, SUPPLIER_FINDER_SYSTEM_PROMPT } from "../prompts";

export class CompareSuppliersUseCase {
  constructor(private readonly ai: AIPort) {}

  async execute(args: { userId: string; productId: string }) {
    const product = await prisma.product.findFirst({
      where: { id: args.productId, userId: args.userId },
      include: { suppliers: true },
    });
    if (!product) throw new NotFoundError("Produit");
    if (product.suppliers.length < 2) {
      throw new ValidationError("Ajoutez au moins deux fournisseurs candidats avant de comparer.");
    }

    const result = await this.ai.generateStructured({
      system: SUPPLIER_FINDER_SYSTEM_PROMPT,
      prompt: buildSupplierComparisonPrompt({
        productName: product.name,
        suppliers: product.suppliers.map((s) => ({
          name: s.name,
          platform: s.platform,
          price: s.price ?? undefined,
          minOrderQty: s.minOrderQty ?? undefined,
          deliveryDays: s.deliveryDays ?? undefined,
          rating: s.rating ?? undefined,
          notes: s.notes ?? undefined,
        })),
      }),
      schema: supplierRecommendationSchema,
      maxTokens: 1536,
    });

    await prisma.searchHistory.create({
      data: {
        userId: args.userId,
        module: "supplier-finder",
        query: { productId: product.id } as unknown as object,
        resultSummary: `Fournisseur recommandé : ${result.recommendedSupplierName} pour "${product.name}"`,
      },
    });

    return result;
  }
}

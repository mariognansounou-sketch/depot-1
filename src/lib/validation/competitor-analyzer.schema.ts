import { z } from "zod";

const manualAdSchema = z.object({
  pageName: z.string().max(120).optional(),
  headline: z.string().max(200).optional(),
  primaryText: z.string().max(4000).optional(),
  description: z.string().max(2000).optional(),
  cta: z.string().max(60).optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(["VIDEO", "IMAGE", "CAROUSEL", "UNKNOWN"]).optional(),
  countries: z.array(z.string()).max(20).optional(),
  languages: z.array(z.string()).max(10).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
  variantsCount: z.number().int().min(1).max(50).optional(),
  sourceUrl: z.string().url().optional(),
  comments: z.array(z.string().max(500)).max(50).optional(),
});

export const competitorAnalysisRequestSchema = z.object({
  mode: z.enum(["AD_URL", "PRODUCT_NAME", "STORE_URL", "BRAND_NAME"]),
  value: z.string().min(2).max(300),
  productId: z.string().cuid().optional(),
  manualAd: manualAdSchema.optional(),
});

export const generateStrategySchema = z.object({
  productId: z.string().cuid(),
  adIds: z.array(z.string().cuid()).min(1).max(10),
  targetCountry: z.string().max(60).optional(),
});

export const compareCompetitorsSchema = z.object({
  productId: z.string().cuid(),
  adIds: z.array(z.string().cuid()).min(2).max(10),
});

export const opportunityAnglesSchema = z.object({
  productId: z.string().cuid(),
});

import { z } from "zod";

export const facebookAdsCopySchema = z.object({
  headline: z.string(),
  primaryText: z.string(),
  description: z.string(),
  cta: z.string(),
});
export type FacebookAdsCopy = z.infer<typeof facebookAdsCopySchema>;

export const whatsappCopySchema = z.object({
  welcomeMessage: z.string(),
  autoReplies: z.array(z.string()).min(2).max(8),
  followUpMessages: z.array(z.string()).min(2).max(6),
  closingMessages: z.array(z.string()).min(1).max(4),
});
export type WhatsAppCopy = z.infer<typeof whatsappCopySchema>;

export const shopifyCopySchema = z.object({
  productTitle: z.string(),
  description: z.string(),
  benefits: z.array(z.string()).min(3).max(8),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).min(3).max(8),
  objections: z.array(z.object({ objection: z.string(), response: z.string() })).min(2).max(6),
  guarantees: z.array(z.string()).min(1).max(4),
});
export type ShopifyCopy = z.infer<typeof shopifyCopySchema>;

export const tiktokCopySchema = z.object({
  shortDescription: z.string(),
  hook: z.string(),
  hashtags: z.array(z.string()).min(3).max(12),
});
export type TikTokCopy = z.infer<typeof tiktokCopySchema>;

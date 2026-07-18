import { z } from "zod";

export const createApiKeySchema = z.object({
  provider: z.enum(["META", "ANTHROPIC", "OPENAI", "TIKTOK"]),
  label: z.string().max(60).optional(),
  value: z.string().min(4).max(500),
});

export const updateSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  locale: z.string().max(10).optional(),
  defaultCountry: z.string().max(10).optional(),
  notifyByEmail: z.boolean().optional(),
  notifyInApp: z.boolean().optional(),
});

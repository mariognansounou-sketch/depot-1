import { z } from "zod";

export const createSupplierSchema = z.object({
  productId: z.string().cuid(),
  name: z.string().min(2).max(120),
  platform: z.enum(["ALIEXPRESS", "ALIBABA", "CJ_DROPSHIPPING", "OTHER"]),
  price: z.number().min(0).optional(),
  minOrderQty: z.number().int().min(1).optional(),
  deliveryDays: z.number().int().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  url: z.string().url().optional(),
  notes: z.string().max(500).optional(),
});

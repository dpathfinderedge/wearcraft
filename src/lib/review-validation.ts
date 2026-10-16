import { z } from 'zod';

export const reviewLookupQuerySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
}).strict();

export const reviewInputSchema = z.object({
  productName: z.string().trim().min(1).max(120).optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(5).max(100),
  comment: z.string().trim().min(20).max(2000),
}).strict();

export function publishedProductReviewsWhere(productId: string) {
  return { productId, published: true };
}

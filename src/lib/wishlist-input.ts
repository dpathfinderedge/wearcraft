import { z } from 'zod';

export const wishlistRequestSchema = z.object({
  productId: z.string().trim().min(1).max(100).optional(),
  productName: z.string().trim().min(1).max(200).optional(),
}).refine(
  (value) => Boolean(value.productId || value.productName),
  { message: 'A product is required' }
);

export type WishlistRequest = z.infer<typeof wishlistRequestSchema>;

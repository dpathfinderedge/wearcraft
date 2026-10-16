import { z } from 'zod';

const priceFilterSchema = z.string()
  .trim()
  .regex(/^(?:\d+(?:\.\d*)?|\.\d+)$/, 'Price filters must be valid non-negative numbers.')
  .transform(Number)
  .pipe(z.number().finite().min(0));

export const productListQuerySchema = z.object({
  category: z.enum(['all', 'mens', 'womens', 'unisex', 'accessories']).optional(),
  search: z.string().trim().max(120).optional().default(''),
  minPrice: priceFilterSchema.optional(),
  maxPrice: priceFilterSchema.optional(),
  size: z.string().trim().min(1).max(80).optional(),
  featured: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  sort: z.enum([
    'featured',
    'price-asc',
    'price-desc',
    'price-low',
    'price-high',
    'newest',
    'rating',
  ]).optional().default('featured'),
  page: z.coerce.number().finite().int().min(1).max(10_000).optional().default(1),
  limit: z.coerce.number().finite().int().min(1).max(100).optional().default(20),
}).strict().refine(
  ({ minPrice, maxPrice }) => minPrice === undefined
    || maxPrice === undefined
    || minPrice <= maxPrice,
  { message: 'Minimum price cannot exceed maximum price.' }
);

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

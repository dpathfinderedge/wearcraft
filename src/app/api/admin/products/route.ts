import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, handleApiError, parseBody, successResponse } from '@/lib/api-response';

const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(10),
  price: z.number().finite().positive(),
  comparePrice: z.number().finite().positive().nullable().optional(),
  category: z.enum(['mens', 'womens', 'unisex', 'accessories']),
  images: z.array(z.string().url()).min(1).max(8),
  sizes: z.array(z.string().trim().min(1)).max(20),
  colors: z.array(z.string().trim().min(1)).max(20),
  material: z.string().trim().max(120).nullable().optional(),
  care: z.string().trim().max(500).nullable().optional(),
  featured: z.boolean(),
  inStock: z.boolean(),
  stockCount: z.number().int().min(0),
});

export type AdminProductInput = z.infer<typeof productSchema>;

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const products = await prisma.product.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { reviews: true, wishlist: true } } },
    });
    return successResponse(products);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const input = productSchema.parse(await parseBody<unknown>(request));
    const product = await prisma.product.create({ data: input });
    return successResponse(product, 'Product created.', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Invalid product data.', 400);
    }
    return handleApiError(error);
  }
}

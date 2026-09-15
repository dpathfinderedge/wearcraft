import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, handleApiError, parseBody, successResponse } from '@/lib/api-response';

const productUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  slug: z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().trim().min(10).optional(),
  price: z.number().finite().positive().optional(),
  comparePrice: z.number().finite().positive().nullable().optional(),
  category: z.enum(['mens', 'womens', 'unisex', 'accessories']).optional(),
  images: z.array(z.string().url()).min(1).max(8).optional(),
  sizes: z.array(z.string().trim().min(1)).max(20).optional(),
  colors: z.array(z.string().trim().min(1)).max(20).optional(),
  material: z.string().trim().max(120).nullable().optional(),
  care: z.string().trim().max(500).nullable().optional(),
  featured: z.boolean().optional(),
  inStock: z.boolean().optional(),
  stockCount: z.number().int().min(0).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const input = productUpdateSchema.parse(await parseBody<unknown>(request));
    const product = await prisma.product.update({ where: { id }, data: input });
    return successResponse(product, 'Product updated.');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Invalid product data.', 400);
    }
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const references = await prisma.product.findUnique({
      where: { id },
      select: { _count: { select: { orderItems: true, reviews: true, wishlist: true } } },
    });
    if (!references) return errorResponse('Product not found', 404);
    if (references._count.orderItems > 0) {
      return errorResponse('Products with order history cannot be deleted. Mark them out of stock instead.', 409);
    }
    await prisma.product.delete({ where: { id } });
    return successResponse({ id }, 'Product deleted.');
  } catch (error) {
    return handleApiError(error);
  }
}

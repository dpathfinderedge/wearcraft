import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId: user.userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(wishlist);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json() as { productId?: string; productName?: string };

    if (!body.productId && !body.productName) {
      return errorResponse('A product is required', 400);
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          body.productId ? { id: body.productId } : undefined,
          body.productName ? { name: body.productName } : undefined,
        ].filter((value): value is { id: string } | { name: string } => Boolean(value)),
      },
      select: { id: true },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: user.userId,
        productId: product.id,
      },
      include: { product: true },
    });

    return successResponse(wishlistItem, 'Added to wishlist', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

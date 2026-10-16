import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response';
import { wishlistRequestSchema } from '@/lib/wishlist-input';

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
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON in request body', 400);
    }

    const validatedData = wishlistRequestSchema.parse(body);
    const product = await prisma.product.findFirst({
      where: validatedData.productId
        ? { id: validatedData.productId }
        : { name: validatedData.productName },
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
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Invalid wishlist request.', 400);
    }
    return handleApiError(error);
  }
}

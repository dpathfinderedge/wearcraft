import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, handleApiError, parseBody, successResponse } from '@/lib/api-response';

const moderationSchema = z.object({ published: z.boolean() });

async function refreshProductRating(productId: string) {
  const aggregate = await prisma.review.aggregate({
    where: { productId, published: true },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: aggregate._avg.rating || 0,
      reviewCount: aggregate._count._all,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const input = moderationSchema.parse(await parseBody<unknown>(request));
    const review = await prisma.review.update({
      where: { id },
      data: { published: input.published },
    });
    await refreshProductRating(review.productId);
    return successResponse(review, 'Review moderation updated.');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Invalid moderation update.', 400);
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
    const review = await prisma.review.delete({ where: { id } });
    await refreshProductRating(review.productId);
    return successResponse({ id });
  } catch (error) {
    return handleApiError(error);
  }
}

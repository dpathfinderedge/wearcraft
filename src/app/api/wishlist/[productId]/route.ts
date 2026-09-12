import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { productId } = await params;
    const item = await prisma.wishlistItem.findFirst({
      where: { userId: user.userId, productId },
      select: { id: true },
    });

    if (!item) {
      return errorResponse('Wishlist item not found', 404);
    }

    await prisma.wishlistItem.delete({ where: { id: item.id } });
    return successResponse({ productId });
  } catch (error) {
    return handleApiError(error);
  }
}

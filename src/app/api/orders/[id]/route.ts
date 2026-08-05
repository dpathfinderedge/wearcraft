import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(request);
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        AND: [
          { id },
          { userId: authUser.userId },
        ],
      },
      include: {
        items: true,
        address: true,
      },
    });

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    return successResponse(order);
  } catch (error) {
    return handleApiError(error);
  }
}
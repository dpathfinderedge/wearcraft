import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { handleApiError, successResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        product: { select: { id: true, name: true, images: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(reviews);
  } catch (error) {
    return handleApiError(error);
  }
}

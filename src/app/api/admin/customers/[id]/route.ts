import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const customer = await prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            items: { select: { id: true, name: true, quantity: true } },
            address: { select: { city: true, state: true, country: true } },
          },
        },
        _count: { select: { orders: true, reviews: true, wishlist: true } },
      },
    });
    if (!customer) return errorResponse('Customer not found', 404);

    const paidSummary = await prisma.order.aggregate({
      where: { userId: id, paymentStatus: 'PAID' },
      _sum: { total: true },
      _count: { _all: true },
    });

    return successResponse({
      ...customer,
      lifetimePaid: paidSummary._sum.total || 0,
      paidOrderCount: paidSummary._count._all,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from 'next/server';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response';

const querySchema = z.object({
  search: z.string().trim().max(120).optional().default(''),
  status: z.nativeEnum(OrderStatus).optional(),
  payment: z.nativeEnum(PaymentStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const parsedQuery = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
    if (!parsedQuery.success) {
      return errorResponse(parsedQuery.error.issues[0]?.message || 'Invalid order filters.', 400);
    }

    const { search, status, payment, page, limit } = parsedQuery.data;
    const where: Prisma.OrderWhereInput = {
      ...(status ? { status } : {}),
      ...(payment ? { paymentStatus: payment } : {}),
      ...(search ? {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
        ],
      } : {}),
    };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [orders, total, allOrdersCount, needsAttention, paidRevenue, todayOrders, statusCounts] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          address: true,
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
      prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { total: true } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    return successResponse({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary: {
        allOrders: allOrdersCount,
        needsAttention,
        paidRevenue: paidRevenue._sum.total || 0,
        todayOrders,
        byStatus: Object.fromEntries(statusCounts.map(({ status: orderStatus, _count }) => [orderStatus, _count._all])),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

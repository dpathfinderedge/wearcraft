import { NextRequest } from 'next/server';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response';

const querySchema = z.object({
  days: z.coerce.number().int().refine((value) => [7, 30, 90].includes(value), 'Choose a 7, 30, or 90 day period.').default(30),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid analytics period.', 400);
    }

    const { days } = parsed.data;
    const now = new Date();
    const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const periodStart = new Date(periodEnd);
    periodStart.setUTCDate(periodStart.getUTCDate() - days);
    const previousStart = new Date(periodStart);
    previousStart.setUTCDate(previousStart.getUTCDate() - days);

    const currentPeriod = { gte: periodStart, lt: now };
    const previousPeriod = { gte: previousStart, lt: periodStart };

    const [
      orderCount,
      paidOrders,
      previousPaidOrders,
      previousOrderCount,
      newCustomers,
      previousNewCustomers,
      orderStatuses,
      paymentStatuses,
      dailySales,
      productQuantities,
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: currentPeriod } }),
      prisma.order.aggregate({
        where: { createdAt: currentPeriod, paymentStatus: 'PAID' },
        _sum: { total: true },
        _count: { _all: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: previousPeriod, paymentStatus: 'PAID' },
        _sum: { total: true },
        _count: { _all: true },
      }),
      prisma.order.count({ where: { createdAt: previousPeriod } }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: currentPeriod } }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: previousPeriod } }),
      prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: currentPeriod },
        _count: { _all: true },
      }),
      prisma.order.groupBy({
        by: ['paymentStatus'],
        where: { createdAt: currentPeriod },
        _count: { _all: true },
        _sum: { total: true },
      }),
      prisma.$queryRaw<Array<{ date: Date; revenue: number; orders: bigint }>>(Prisma.sql`
        SELECT
          date_trunc('day', "createdAt") AS date,
          COALESCE(SUM(total), 0)::float8 AS revenue,
          COUNT(*)::bigint AS orders
        FROM "Order"
        WHERE "createdAt" >= ${periodStart}
          AND "createdAt" < ${now}
          AND "paymentStatus" = 'PAID'
        GROUP BY date_trunc('day', "createdAt")
        ORDER BY date_trunc('day', "createdAt") ASC
      `),
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: { createdAt: currentPeriod, paymentStatus: 'PAID' } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const products = productQuantities.length
      ? await prisma.product.findMany({
          where: { id: { in: productQuantities.map((item) => item.productId) } },
          select: { id: true, name: true, images: true, category: true },
        })
      : [];
    const productsById = new Map(products.map((product) => [product.id, product]));
    const statusCounts = Object.fromEntries(
      orderStatuses.map(({ status, _count }) => [status, _count._all])
    ) as Record<OrderStatus, number>;
    const paymentCounts = Object.fromEntries(
      paymentStatuses.map(({ paymentStatus, _count, _sum }) => [
        paymentStatus,
        { count: _count._all, amount: _sum.total || 0 },
      ])
    ) as Partial<Record<PaymentStatus, { count: number; amount: number }>>;

    return successResponse({
      period: {
        days,
        start: periodStart.toISOString(),
        end: now.toISOString(),
        previousStart: previousStart.toISOString(),
      },
      metrics: {
        revenue: paidOrders._sum.total || 0,
        paidOrders: paidOrders._count._all,
        averageOrderValue: paidOrders._count._all
          ? (paidOrders._sum.total || 0) / paidOrders._count._all
          : 0,
        totalOrders: orderCount,
        newCustomers,
        previousRevenue: previousPaidOrders._sum.total || 0,
        previousPaidOrders: previousPaidOrders._count._all,
        previousTotalOrders: previousOrderCount,
        previousNewCustomers,
      },
      salesByDay: dailySales.map((row) => ({
        date: row.date.toISOString(),
        revenue: Number(row.revenue),
        orders: Number(row.orders),
      })),
      ordersByStatus: statusCounts,
      paymentsByStatus: paymentCounts,
      topProducts: productQuantities.map((item) => {
        const product = productsById.get(item.productId);
        return {
          id: item.productId,
          name: product?.name || 'Unavailable product',
          image: product?.images[0] || null,
          category: product?.category || '',
          unitsSold: item._sum.quantity || 0,
        };
      }),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

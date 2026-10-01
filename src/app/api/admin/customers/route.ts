import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response';

const querySchema = z.object({
  search: z.string().trim().max(120).optional().default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const parsedQuery = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
    if (!parsedQuery.success) {
      return errorResponse(parsedQuery.error.issues[0]?.message || 'Invalid customer filters.', 400);
    }

    const { search, page, limit } = parsedQuery.data;
    const where: Prisma.UserWhereInput = {
      role: 'CUSTOMER',
      ...(search ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    };
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [customers, total, allCustomers, recentCustomers, customersWithOrders] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: { select: { orders: true, reviews: true, wishlist: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { role: 'CUSTOMER', orders: { some: {} } } }),
    ]);

    return successResponse({
      customers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary: { allCustomers, recentCustomers, customersWithOrders },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

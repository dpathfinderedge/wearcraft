import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response';
import { productListQuerySchema } from '@/lib/product-query';

export async function GET(request: NextRequest) {
  try {
    const parsedQuery = productListQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams)
    );
    if (!parsedQuery.success) {
      return errorResponse(
        parsedQuery.error.issues[0]?.message || 'Invalid product filters.',
        400
      );
    }
    const { category, search, minPrice, maxPrice, size, featured, sort, page, limit } = parsedQuery.data;
    const where: Prisma.ProductWhereInput = {
      inStock: true,
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (size) {
      where.sizes = {
        has: size,
      };
    }

    if (featured !== undefined) {
      where.featured = featured;
    }
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sort) {
      case 'price-asc':
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      default:
        orderBy = { featured: 'desc' };
    }
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return successResponse({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

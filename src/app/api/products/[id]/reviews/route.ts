import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { errorResponse, handleApiError, parseBody, successResponse } from '@/lib/api-response';

const reviewInputSchema = z.object({
  productName: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(5).max(100),
  comment: z.string().trim().min(20).max(2000),
});

async function findProduct(id: string, productName?: string) {
  return prisma.product.findFirst({
    where: {
      OR: [
        { id },
        { slug: id },
        ...(productName ? [{ name: productName }] : []),
      ],
    },
    select: { id: true },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productName = request.nextUrl.searchParams.get('name') || undefined;
    const product = await findProduct(id, productName);

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        verified: true,
        helpful: true,
        createdAt: true,
        user: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const reviewCount = reviews.length;
    const averageRating = reviewCount
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

    return successResponse({
      reviews,
      summary: {
        averageRating: Number(averageRating.toFixed(1)),
        reviewCount,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(request);
    const { id } = await params;
    const body = await parseBody<unknown>(request);
    const validatedData = reviewInputSchema.parse(body);
    const product = await findProduct(id, validatedData.productName);

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: authUser.userId,
          productId: product.id,
        },
      },
    });

    if (existingReview) {
      return errorResponse('You have already reviewed this product.', 409);
    }

    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          userId: authUser.userId,
          paymentStatus: 'PAID',
        },
      },
      select: { id: true },
    });

    const review = await prisma.$transaction(async (transaction) => {
      const createdReview = await transaction.review.create({
        data: {
          userId: authUser.userId,
          productId: product.id,
          rating: validatedData.rating,
          title: validatedData.title,
          comment: validatedData.comment,
          verified: Boolean(purchase),
        },
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          verified: true,
          helpful: true,
          createdAt: true,
          user: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      const aggregate = await transaction.review.aggregate({
        where: { productId: product.id },
        _avg: { rating: true },
        _count: { _all: true },
      });

      await transaction.product.update({
        where: { id: product.id },
        data: {
          rating: aggregate._avg.rating || 0,
          reviewCount: aggregate._count._all,
        },
      });

      return createdReview;
    });

    return successResponse(review, 'Review submitted successfully.', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Invalid review.', 400);
    }
    return handleApiError(error);
  }
}

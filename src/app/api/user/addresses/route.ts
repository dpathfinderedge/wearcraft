import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, parseBody } from '@/lib/api-response';
import { addressCreateSchema } from '@/lib/account-validation';

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);

    const addresses = await prisma.address.findMany({
      where: { userId: authUser.userId },
      orderBy: { isDefault: 'desc' },
    });

    return successResponse(addresses);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const body = await parseBody<unknown>(request);
    const validatedData = addressCreateSchema.parse(body);

    const address = await prisma.$transaction(async (transaction) => {
      const existingAddressCount = await transaction.address.count({
        where: { userId: authUser.userId },
      });
      const isDefault = existingAddressCount === 0 || validatedData.isDefault === true;

      if (isDefault) {
        await transaction.address.updateMany({
          where: { userId: authUser.userId },
          data: { isDefault: false },
        });
      }

      return transaction.address.create({
        data: {
          ...validatedData,
          userId: authUser.userId,
          isDefault,
        },
      });
    });

    return successResponse(address, 'Address created successfully', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Invalid address data', 400);
    }
    return handleApiError(error);
  }
}

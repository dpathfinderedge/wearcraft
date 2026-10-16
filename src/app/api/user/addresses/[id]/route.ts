import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, parseBody } from '@/lib/api-response';
import { addressUpdateSchema } from '@/lib/account-validation';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(request);
    const body = await parseBody<unknown>(request);
    const validatedData = addressUpdateSchema.parse(body);
    const { id } = await params;

    const updatedAddress = await prisma.$transaction(async (transaction) => {
      const address = await transaction.address.findFirst({
        where: { id, userId: authUser.userId },
      });
      if (!address) return null;

      const nextAddress = address.isDefault && validatedData.isDefault === false
        ? await transaction.address.findFirst({
          where: { userId: authUser.userId, id: { not: id } },
          orderBy: { createdAt: 'asc' },
        })
        : null;
      const data = {
        firstName: validatedData.firstName ?? address.firstName,
        lastName: validatedData.lastName ?? address.lastName,
        address: validatedData.address ?? address.address,
        city: validatedData.city ?? address.city,
        state: validatedData.state ?? address.state,
        zipCode: validatedData.zipCode ?? address.zipCode,
        country: validatedData.country ?? address.country,
        phone: validatedData.phone ?? address.phone,
        isDefault: address.isDefault
          && validatedData.isDefault === false
          && !nextAddress
          ? true
          : validatedData.isDefault ?? address.isDefault,
      };

      if (validatedData.isDefault === true) {
        await transaction.address.updateMany({
          where: { userId: authUser.userId },
          data: { isDefault: false },
        });
      }

      const updated = await transaction.address.update({
        where: { id },
        data,
      });

      if (address.isDefault && validatedData.isDefault === false) {
        if (nextAddress) {
          await transaction.address.updateMany({
            where: { id: nextAddress.id, userId: authUser.userId },
            data: { isDefault: true },
          });
        }
      }

      return updated;
    });

    if (!updatedAddress) {
      return errorResponse('Address not found', 404);
    }

    return successResponse(updatedAddress, 'Address updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Invalid address data', 400);
    }
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(request);
    const { id } = await params;

    const deleted = await prisma.$transaction(async (transaction) => {
      const address = await transaction.address.findFirst({
        where: { id, userId: authUser.userId },
      });
      if (!address) return false;

      await transaction.address.delete({ where: { id } });

      if (address.isDefault) {
        const nextAddress = await transaction.address.findFirst({
          where: { userId: authUser.userId },
          orderBy: { createdAt: 'asc' },
        });
        if (nextAddress) {
          await transaction.address.updateMany({
            where: { id: nextAddress.id, userId: authUser.userId },
            data: { isDefault: true },
          });
        }
      }
      return true;
    });

    if (!deleted) {
      return errorResponse('Address not found', 404);
    }

    return successResponse(null, 'Address deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

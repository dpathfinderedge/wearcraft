import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, parseBody } from '@/lib/api-response';

const addressUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  address: z.string().min(5, 'Address is required').optional(),
  city: z.string().min(2, 'City is required').optional(),
  state: z.string().min(2, 'State is required').optional(),
  zipCode: z.string().min(3, 'Postal code is required').optional(),
  country: z.string().min(2, 'Country is required').optional(),
  phone: z.string().min(7, 'Phone number is required').optional(),
  isDefault: z.boolean().optional(),
});

type AddressUpdateInput = z.infer<typeof addressUpdateSchema>;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(request);
    const body = await parseBody<AddressUpdateInput>(request);
    const validatedData = addressUpdateSchema.parse(body);
    const { id } = await params;

    const address = await prisma.address.findFirst({
      where: { id, userId: authUser.userId },
    });

    if (!address) {
      return errorResponse('Address not found', 404);
    }

    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: { userId: authUser.userId },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        firstName: validatedData.firstName ?? address.firstName,
        lastName: validatedData.lastName ?? address.lastName,
        address: validatedData.address ?? address.address,
        city: validatedData.city ?? address.city,
        state: validatedData.state ?? address.state,
        zipCode: validatedData.zipCode ?? address.zipCode,
        country: validatedData.country ?? address.country,
        phone: validatedData.phone ?? address.phone,
        isDefault: validatedData.isDefault ?? address.isDefault,
      },
    });
    if (validatedData.isDefault && !address.isDefault) {
      await prisma.address.updateMany({
        where: { userId: authUser.userId, id: { not: id } },
        data: { isDefault: false },
      });
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

    const address = await prisma.address.findFirst({
      where: { id, userId: authUser.userId },
    });

    if (!address) {
      return errorResponse('Address not found', 404);
    }

    await prisma.address.delete({ where: { id } });

    if (address.isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { userId: authUser.userId },
        orderBy: { createdAt: 'asc' },
      });

      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return successResponse(null, 'Address deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

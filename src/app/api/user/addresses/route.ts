import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, parseBody } from '@/lib/api-response';

const addressCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().min(7, 'Phone number is required'),
  isDefault: z.boolean().optional(),
});

type AddressCreateInput = z.infer<typeof addressCreateSchema>;

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
    const body = await parseBody<AddressCreateInput>(request);
    const validatedData = addressCreateSchema.parse(body);

    const existingAddressCount = await prisma.address.count({
      where: { userId: authUser.userId },
    });

    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: { userId: authUser.userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: authUser.userId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        country: validatedData.country,
        phone: validatedData.phone,
        isDefault: validatedData.isDefault ?? existingAddressCount === 0,
      },
    });

    return successResponse(address, 'Address created successfully', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Invalid address data', 400);
    }
    return handleApiError(error);
  }
}

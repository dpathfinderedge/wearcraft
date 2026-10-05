import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, parseBody } from '@/lib/api-response';
import { sendAccountUpdateEmail } from '@/lib/email';

const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const body = await parseBody<ProfileUpdateInput>(request);
    const validatedData = profileUpdateSchema.parse(body);
    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true },
    });

    if (!currentUser) {
      return errorResponse('User not found', 404);
    }

    const user = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const profileChanged = user.firstName !== currentUser.firstName
      || user.lastName !== currentUser.lastName
      || (validatedData.phone !== undefined && user.phone !== currentUser.phone);
    const emailResult = profileChanged
      ? await sendAccountUpdateEmail({ email: currentUser.email, firstName: user.firstName })
      : null;

    return successResponse(
      user,
      emailResult && !emailResult.sent
        ? 'Profile updated, but the account notification email could not be sent.'
        : 'Profile updated successfully.'
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Invalid profile data', 400);
    }
    return handleApiError(error);
  }
}

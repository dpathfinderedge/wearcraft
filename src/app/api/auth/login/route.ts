import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON in request body', 400);
    }
    const validatedData = loginSchema.parse(body);
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
      },
    });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }
    const isValidPassword = await verifyPassword(
      validatedData.password,
      user.password
    );

    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401);
    }
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    await setAuthCookie(token);
    const { password, ...userWithoutPassword } = user;
    void password;

    return successResponse(
      {
        user: userWithoutPassword,
        token,
      },
      'Login successful'
    );
  } catch (error) {
   if (error instanceof z.ZodError) {
      const issues = error.issues || [];
      const firstError = issues[0];

      if (firstError && firstError.message) {
        return errorResponse(firstError.message, 400);
      }
      return errorResponse('Validation failed', 400);
    }

    return handleApiError(error);
  }
}

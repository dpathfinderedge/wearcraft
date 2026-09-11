import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON in request body', 400);
    }

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Find user
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

    // Verify password
    const isValidPassword = await verifyPassword(
      validatedData.password,
      user.password
    );

    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401);
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
    });

    // Set cookie
    await setAuthCookie(token);

    // Remove password from response
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
import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

// Validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
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
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
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
      },
    });

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
    });

    // Set cookie
    await setAuthCookie(token);

    return successResponse(
      {
        user,
        token,
      },
      'Account created successfully',
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues || [];
      const firstError = issues[0];
      
      if (firstError && firstError.message) {
        return errorResponse(firstError.message, 400);
      }

      return handleApiError(error);
    }

    return handleApiError(error);
  }
}
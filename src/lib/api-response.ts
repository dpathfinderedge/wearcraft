import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Success response
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

// Error response
export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

// Handle API errors
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        return errorResponse('A record with this value already exists', 409);
      case 'P2025':
        // Record not found
        return errorResponse('Record not found', 404);
      case 'P2003':
        // Foreign key constraint violation
        return errorResponse('Related record not found', 400);
      case 'P2014':
        // Invalid relation
        return errorResponse('Invalid relationship data', 400);
      default:
        return errorResponse(`Database error: ${error.code}`, 500);
    }
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return errorResponse('Invalid data provided', 400);
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized. Please login.', 401);
    }

    if (error.message.includes('not found')) {
      return errorResponse('Resource not found', 404);
    }

    // Return the error message for development
    return errorResponse(
      process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An error occurred',
      500
    );
  }

  // Fallback for unknown errors
  return errorResponse('An unexpected error occurred', 500);
}

// Parse request body safely
export async function parseBody<T>(request: Request): Promise<T> {
  try {
    const body = await request.json();
    return body as T;
  } catch {
    throw new Error('Invalid request body');
  }
}

// CORS headers (if needed)
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
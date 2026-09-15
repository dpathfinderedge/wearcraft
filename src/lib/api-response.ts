import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
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
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return errorResponse('A record with this value already exists', 409);
      case 'P2025':
        return errorResponse('Record not found', 404);
      case 'P2003':
        return errorResponse('Related record not found', 400);
      case 'P2014':
        return errorResponse('Invalid relationship data', 400);
      default:
        return errorResponse(`Database error: ${error.code}`, 500);
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    return errorResponse('Invalid data provided', 400);
  }
  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized. Please login.', 401);
    }
    if (error.message === 'Forbidden') {
      return errorResponse('You do not have permission to perform this action.', 403);
    }

    if (error.message.includes('not found')) {
      return errorResponse('Resource not found', 404);
    }
    return errorResponse(
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'An error occurred',
      500
    );
  }
  return errorResponse('An unexpected error occurred', 500);
}
export async function parseBody<T>(request: Request): Promise<T> {
  try {
    const body = await request.json();
    return body as T;
  } catch {
    throw new Error('Invalid request body');
  }
}
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
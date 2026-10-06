import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, parseBody } from '@/lib/api-response';
import {
  PaystackVerificationError,
  verifyPaystackTransaction,
} from '@/lib/paystack-server';

const verifyRequestSchema = z.object({
  reference: z.string().trim().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const body = verifyRequestSchema.parse(await parseBody<unknown>(request));
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { email: true },
    });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const transaction = await verifyPaystackTransaction(body.reference);
    if (transaction.customer.email.toLowerCase() !== user.email.toLowerCase()) {
      return errorResponse('Payment email does not match your account.', 409);
    }

    return successResponse(
      {
        verified: true,
        reference: transaction.reference,
        amount: transaction.amount,
        currency: transaction.currency,
      },
      'Payment verified successfully'
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Invalid payment verification request.', 400);
    }
    if (error instanceof PaystackVerificationError) {
      return errorResponse(error.message, error.status);
    }
    return handleApiError(error);
  }
}

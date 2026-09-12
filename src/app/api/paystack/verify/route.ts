import { NextRequest } from 'next/server';
import { successResponse, errorResponse, handleApiError, parseBody } from '@/lib/api-response';

interface VerifyRequest {
  reference: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody<VerifyRequest>(request);
    if (!body.reference) {
      return errorResponse('Payment reference is required', 400);
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret) {
      return successResponse({ verified: true, reference: body.reference }, 'Payment verification simulated');
    }

    const verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(body.reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: "Bearer " + paystackSecret,
          'Content-Type': 'application/json',
        },
      }
    );
    const verificationData = await verificationResponse.json();

    if (!verificationResponse.ok || !verificationData.status) {
      return errorResponse('Payment verification failed', 402);
    }
    if (!verificationData.data || verificationData.data.status !== 'success') {
      return errorResponse('Payment not completed', 402);
    }

    return successResponse(
      {
        verified: true,
        reference: verificationData.data.reference,
        amount: verificationData.data.amount,
        currency: verificationData.data.currency,
      },
      'Payment verified successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

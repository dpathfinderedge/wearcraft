import { successResponse } from '@/lib/api-response';
import { isPaystackConfigured } from '@/lib/payment-config';

export async function GET() {
  return successResponse({
    available: isPaystackConfigured(
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      process.env.PAYSTACK_SECRET_KEY
    ),
  });
}

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import prisma from '@/lib/prisma';

// Paystack sends X-Paystack-Signature header (sha512 HMAC of raw body)
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const raw = await req.text();

    if (!secret) {
      // In dev, accept the webhook but log notice
      console.warn('PAYSTACK_SECRET_KEY not set; accepting webhook in simulated mode');
    } else {
      const signature = req.headers.get('x-paystack-signature') || '';
      const hash = crypto.createHmac('sha512', secret).update(raw).digest('hex');
      if (!signature || signature !== hash) {
        return errorResponse('Invalid signature', 401);
      }
    }

    let body: any = {};
    try {
      body = JSON.parse(raw);
    } catch (e) {
      // If parsing fails, return bad request
      return errorResponse('Invalid JSON body', 400);
    }

    const event = body.event || '';
    const data = body.data || body;

    // Handle successful charge/transaction events
    if (data && (data.status === 'success' || event === 'charge.success' || event === 'transfer.success')) {
      const reference: string = data.reference;

      if (reference) {
        // Try to find matching order by paymentRef or notes containing the reference or orderNumber in metadata
        const existingOrder = await prisma.order.findFirst({
          where: {
            OR: [
              { paymentRef: reference },
              { notes: { contains: reference } },
              { orderNumber: reference },
            ],
          },
        });

        if (existingOrder) {
          await prisma.order.update({
            where: { id: existingOrder.id },
            data: { paymentStatus: 'PAID', paymentRef: reference },
          });
          return successResponse({ ok: true }, 'Order marked as paid');
        }

        // No matching order found — return success so Paystack won't retry, but log for manual investigation
        console.warn('Webhook received but no matching order found for reference:', reference);
        return successResponse({ ok: true }, 'No matching order found');
      }
    }

    // For other events, just return success
    return successResponse({ ok: true }, 'Event ignored');
  } catch (error) {
    return handleApiError(error);
  }
}

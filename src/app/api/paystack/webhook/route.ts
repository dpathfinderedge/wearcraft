import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { matchesPaystackPayment } from '@/lib/paystack-server';
import { z } from 'zod';

const webhookEventSchema = z.object({
  event: z.string(),
  data: z.unknown(),
});

const successfulChargeSchema = z.object({
    status: z.string().optional(),
    reference: z.string().min(1).max(100),
    amount: z.number().int().nonnegative(),
    currency: z.string(),
    customer: z.object({ email: z.string().email() }),
});

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error('PAYSTACK_SECRET_KEY is required to authenticate payment webhooks.');
      return errorResponse('Payment webhook is not configured.', 503);
    }

    const raw = await req.text();
    const signature = req.headers.get('x-paystack-signature') || '';
    const hash = crypto.createHmac('sha512', secret).update(raw).digest('hex');
    const suppliedSignature = Buffer.from(signature, 'hex');
    const expectedSignature = Buffer.from(hash, 'hex');
    if (
      !/^[a-f\d]{128}$/i.test(signature)
      || suppliedSignature.length !== expectedSignature.length
      || !crypto.timingSafeEqual(suppliedSignature, expectedSignature)
    ) {
      return errorResponse('Invalid signature', 401);
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const eventPayload = webhookEventSchema.safeParse(body);
    if (!eventPayload.success) {
      return errorResponse(eventPayload.error.issues[0]?.message || 'Invalid webhook payload.', 400);
    }
    if (eventPayload.data.event !== 'charge.success') {
      return successResponse({ ok: true }, 'Event ignored');
    }
    const charge = successfulChargeSchema.safeParse(eventPayload.data.data);
    if (!charge.success) {
      return errorResponse(charge.error.issues[0]?.message || 'Invalid charge event payload.', 400);
    }
    const data = charge.data;
    if (data.status !== 'success') return successResponse({ ok: true }, 'Event ignored');

    const order = await prisma.order.findUnique({
      where: { paymentRef: data.reference },
      select: {
        id: true,
        total: true,
        user: { select: { email: true } },
      },
    });
    if (!order) {
      return errorResponse('Order for this payment has not been created yet. PayStack may retry this event.', 503);
    }
    if (!matchesPaystackPayment(data, order.total, order.user.email)) {
      console.error('PayStack webhook amount, currency, or customer does not match the order.', {
        orderId: order.id,
        reference: data.reference,
      });
      return errorResponse('Payment details do not match the order.', 409);
    }

    await prisma.order.updateMany({
      where: {
        id: order.id,
        paymentRef: data.reference,
        paymentStatus: { not: 'PAID' },
      },
      data: { paymentStatus: 'PAID' },
    });

    return successResponse({ ok: true }, 'Payment is finalized');
  } catch (error) {
    return handleApiError(error);
  }
}

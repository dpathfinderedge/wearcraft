import crypto from 'crypto';
import { z } from 'zod';
import { matchesPaystackPayment } from './paystack-server';

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

interface PaystackWebhookOrder {
  id: string;
  total: number;
  user: { email: string };
}

interface PaystackWebhookDependencies {
  getSecret: () => string | undefined;
  findOrder: (reference: string) => Promise<PaystackWebhookOrder | null>;
  markOrderPaid: (orderId: string, reference: string) => Promise<void>;
  logger?: Pick<Console, 'error'>;
}

function errorResponse(message: string, status: number): Response {
  return Response.json({ success: false, error: message }, { status });
}

function successResponse(message: string): Response {
  return Response.json(
    { success: true, data: { ok: true }, message },
    { status: 200 }
  );
}

export function createPaystackWebhookHandler({
  getSecret,
  findOrder,
  markOrderPaid,
  logger = console,
}: PaystackWebhookDependencies): (request: Request) => Promise<Response> {
  return async function handlePaystackWebhook(request: Request): Promise<Response> {
    const secret = getSecret();
    if (!secret) {
      logger.error('PAYSTACK_SECRET_KEY is required to authenticate payment webhooks.');
      return errorResponse('Payment webhook is not configured.', 503);
    }

    const raw = await request.text();
    const signature = request.headers.get('x-paystack-signature') || '';
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
      return errorResponse(
        eventPayload.error.issues[0]?.message || 'Invalid webhook payload.',
        400
      );
    }
    if (eventPayload.data.event !== 'charge.success') {
      return successResponse('Event ignored');
    }

    const charge = successfulChargeSchema.safeParse(eventPayload.data.data);
    if (!charge.success) {
      return errorResponse(
        charge.error.issues[0]?.message || 'Invalid charge event payload.',
        400
      );
    }
    const data = charge.data;
    if (data.status !== 'success') {
      return successResponse('Event ignored');
    }

    const order = await findOrder(data.reference);
    if (!order) {
      return errorResponse(
        'Order for this payment has not been created yet. PayStack may retry this event.',
        503
      );
    }
    if (!matchesPaystackPayment(data, order.total, order.user.email)) {
      logger.error('PayStack webhook amount, currency, or customer does not match the order.', {
        orderId: order.id,
        reference: data.reference,
      });
      return errorResponse('Payment details do not match the order.', 409);
    }

    await markOrderPaid(order.id, data.reference);
    return successResponse('Payment is finalized');
  };
}

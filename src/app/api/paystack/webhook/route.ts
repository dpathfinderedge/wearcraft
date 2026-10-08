import { handleApiError } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { createPaystackWebhookHandler } from '@/lib/paystack-webhook';

const handlePaystackWebhook = createPaystackWebhookHandler({
  getSecret: () => process.env.PAYSTACK_SECRET_KEY,
  findOrder: (reference) => prisma.order.findUnique({
    where: { paymentRef: reference },
    select: {
      id: true,
      total: true,
      user: { select: { email: true } },
    },
  }),
  markOrderPaid: async (orderId, reference) => {
    await prisma.order.updateMany({
      where: {
        id: orderId,
        paymentRef: reference,
        paymentStatus: { not: 'PAID' },
      },
      data: { paymentStatus: 'PAID' },
    });
  },
});

export async function POST(request: Request): Promise<Response> {
  try {
    return await handlePaystackWebhook(request);
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from 'next/server';
import { OrderStatus } from '@prisma/client';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, handleApiError, parseBody, successResponse } from '@/lib/api-response';

const statusSchema = z.object({ status: z.nativeEnum(OrderStatus) });

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const orderDetails = {
  user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
  address: true,
  items: true,
} satisfies NonNullable<Parameters<typeof prisma.order.findUnique>[0]>['include'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id }, include: orderDetails });
    if (!order) return errorResponse('Order not found', 404);
    return successResponse(order);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const input = statusSchema.parse(await parseBody<unknown>(request));
    const current = await prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true, paymentStatus: true },
    });
    if (!current) return errorResponse('Order not found', 404);
    if (input.status === current.status) {
      const unchanged = await prisma.order.findUnique({ where: { id }, include: orderDetails });
      return successResponse(unchanged);
    }
    if (!allowedTransitions[current.status].includes(input.status)) {
      return errorResponse(`An order cannot move from ${current.status.toLowerCase()} to ${input.status.toLowerCase()}.`, 409);
    }
    if (input.status !== 'CANCELLED' && current.paymentStatus !== 'PAID') {
      return errorResponse('Payment must be verified before fulfilment can proceed.', 409);
    }
    if (input.status === 'CANCELLED' && current.paymentStatus === 'PAID') {
      return errorResponse('This order has been paid. Process a refund before cancelling it.', 409);
    }

    const updated = await prisma.order.updateMany({
      where: {
        id,
        status: current.status,
        paymentStatus: current.paymentStatus,
      },
      data: { status: input.status },
    });
    if (updated.count === 0) {
      return errorResponse('The order changed while you were updating it. Refresh and try again.', 409);
    }
    const order = await prisma.order.findUnique({ where: { id }, include: orderDetails });
    return successResponse(order, 'Order fulfilment status updated.');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Invalid order status.', 400);
    }
    return handleApiError(error);
  }
}

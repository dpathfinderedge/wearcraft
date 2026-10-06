import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, parseBody } from '@/lib/api-response';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { calculateOrderTotals } from '@/lib/order-pricing';
import {
  matchesPaystackPayment,
  PaystackVerificationError,
  verifyPaystackTransaction,
} from '@/lib/paystack-server';

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().trim().min(1),
    quantity: z.number().int().min(1).max(20),
    size: z.string().trim().max(80).optional(),
    color: z.string().trim().max(80).optional(),
  })).min(1).max(50),
  address: z.object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    address: z.string().trim().min(1).max(300),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    zipCode: z.string().trim().min(1).max(30),
    country: z.string().trim().min(1).max(100),
    phone: z.string().trim().min(1).max(40),
  }),
  paymentReference: z.string().trim().min(1).max(100).optional(),
});

class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

function paymentError(error: unknown) {
  if (error instanceof z.ZodError) {
    return errorResponse(error.issues[0]?.message || 'Invalid order data.', 400);
  }
  if (error instanceof OrderValidationError) {
    return errorResponse(error.message, 409);
  }
  if (error instanceof PaystackVerificationError) {
    return errorResponse(error.message, error.status);
  }
  return handleApiError(error);
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);

    const orders = await prisma.order.findMany({
      where: { userId: authUser.userId },
      include: {
        items: true,
        address: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(orders);
  } catch (error) {
    return handleApiError(error);
  }
}
export async function POST(request: NextRequest) {
  let authenticatedUserId: string | undefined;
  let paymentReferenceForRetry: string | undefined;

  try {
    const authUser = await requireAuth(request);
    authenticatedUserId = authUser.userId;
    const body = await parseBody<unknown>(request);
    const validatedData = createOrderSchema.parse(body);
    paymentReferenceForRetry = validatedData.paymentReference;
    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { email: true },
    });
    if (!currentUser) {
      return errorResponse('User not found', 404);
    }

    if (validatedData.paymentReference) {
      const existingOrder = await prisma.order.findFirst({
        where: { paymentRef: validatedData.paymentReference },
        include: { items: true, address: true },
      });
      if (existingOrder) {
        if (existingOrder.userId !== authUser.userId) {
          return errorResponse('This payment reference is already associated with another order.', 409);
        }
        return successResponse(existingOrder, 'This payment has already been applied to your order.');
      }
    }

    const products = await Promise.all(
      validatedData.items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            sizes: true,
            colors: true,
            inStock: true,
            stockCount: true,
          },
        });

        if (!product || !product.inStock || product.stockCount < item.quantity) {
          throw new OrderValidationError('A selected product is unavailable or has insufficient stock.');
        }
        if (item.size && !product.sizes.includes(item.size)) {
          throw new OrderValidationError(`The selected size is no longer available for ${product.name}.`);
        }
        if (item.color && !product.colors.includes(item.color)) {
          throw new OrderValidationError(`The selected color is no longer available for ${product.name}.`);
        }
        if (!Number.isFinite(product.price) || product.price < 0 || !product.images[0]) {
          throw new OrderValidationError(`Product data is incomplete for ${product.name}.`);
        }

        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: product.images[0],
        };
      })
    );

    const subtotal = products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const totals = calculateOrderTotals(subtotal);
    let paymentReference: string | undefined;
    if (validatedData.paymentReference) {
      const transaction = await verifyPaystackTransaction(validatedData.paymentReference);
      if (!matchesPaystackPayment(transaction, totals.total, currentUser.email)) {
        return errorResponse(
          'The verified payment amount, currency, or customer does not match this order.',
          409
        );
      }
      paymentReference = transaction.reference;
    }

    const orderNumber = `ORD-${Date.now()}-${nanoid(6).toUpperCase()}`;
    const order = await prisma.$transaction(async (transaction) => {
      const address = await transaction.address.create({
        data: {
          userId: authUser.userId,
          ...validatedData.address,
        },
      });

      const orderData: Prisma.OrderUncheckedCreateInput = {
        orderNumber,
        userId: authUser.userId,
        addressId: address.id,
        ...totals,
        paymentMethod: paymentReference ? 'paystack' : 'card',
        items: {
          create: products,
        },
      };

      if (paymentReference) {
        orderData.paymentRef = paymentReference;
        orderData.paymentStatus = 'PAID';
      }

      return transaction.order.create({
        data: orderData,
        include: {
          items: true,
          address: true,
        },
      });
    });

    const emailResult = await sendOrderConfirmationEmail({
      recipient: {
        email: currentUser.email,
        firstName: validatedData.address.firstName,
      },
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
    });

    return successResponse(
      order,
      emailResult.sent
        ? 'Order created successfully.'
        : 'Order created, but the confirmation email could not be sent. You can still view your order in your account.',
      201
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      if (paymentReferenceForRetry && authenticatedUserId) {
        const existingOrder = await prisma.order.findFirst({
          where: { paymentRef: paymentReferenceForRetry, userId: authenticatedUserId },
          include: { items: true, address: true },
        });
        if (existingOrder) {
          return successResponse(existingOrder, 'This payment has already been applied to your order.');
        }
      }
    }
    return paymentError(error);
  }
}

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, parseBody } from '@/lib/api-response';
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    size: z.string().optional(),
    color: z.string().optional(),
    image: z.string(),
  })),
  address: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
    phone: z.string(),
  }),
  subtotal: z.number(),
  shipping: z.number(),
  tax: z.number(),
  total: z.number(),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
});

type CreateOrderInput = z.infer<typeof createOrderSchema>;
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
  try {
    const authUser = await requireAuth(request);
    const body = await parseBody<CreateOrderInput>(request);
    const validatedData = createOrderSchema.parse(body);
    const orderNumber = `ORD-${Date.now()}-${nanoid(6).toUpperCase()}`;
    const resolvedItems = await Promise.all(
      validatedData.items.map(async (item) => {
        const product = await prisma.product.findFirst({
          where: {
            OR: [
              { id: item.productId },
              { name: item.name },
            ],
          },
          select: { id: true },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.name}`);
        }

        return { ...item, productId: product.id };
      })
    );

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
        subtotal: validatedData.subtotal,
        shipping: validatedData.shipping,
        tax: validatedData.tax,
        total: validatedData.total,
        paymentMethod: validatedData.paymentMethod || 'paystack',
        notes: validatedData.notes,
        items: {
          create: resolvedItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.image,
          })),
        },
      };

      if (validatedData.paymentReference) {
        orderData.paymentRef = validatedData.paymentReference;
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

    return successResponse(order, 'Order created successfully', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }
    return handleApiError(error);
  }
}

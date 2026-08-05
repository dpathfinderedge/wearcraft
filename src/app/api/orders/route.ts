import { NextRequest } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, parseBody } from '@/lib/api-response';

// Validation schema
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

// GET - Get user's orders
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

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const body = await parseBody<CreateOrderInput>(request);
    const validatedData = createOrderSchema.parse(body);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${nanoid(6).toUpperCase()}`;

    // Create or find address
    const address = await prisma.address.create({
      data: {
        userId: authUser.userId,
        ...validatedData.address,
      },
    });

    // Create order with items
    const orderData: any = {
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
        create: validatedData.items.map((item: any) => ({
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

    // If a payment reference was provided (e.g., after successful Paystack verification), mark as paid
    if (validatedData.paymentReference) {
      orderData.paymentRef = validatedData.paymentReference;
      orderData.paymentStatus = 'PAID';
    }

    const order = await prisma.order.create({
      data: orderData,
      include: {
        items: true,
        address: true,
      },
    });

    return successResponse(order, 'Order created successfully', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }
    return handleApiError(error);
  }
}
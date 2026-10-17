import { z } from 'zod';
import { MAX_ORDER_ITEM_QUANTITY } from './order-limits';

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().trim().min(1),
    quantity: z.number().int().min(1).max(MAX_ORDER_ITEM_QUANTITY),
    size: z.string().trim().max(80).optional(),
    color: z.string().trim().max(80).optional(),
  }).strict()).min(1).max(50),
  address: z.object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    address: z.string().trim().min(1).max(300),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    zipCode: z.string().trim().min(1).max(30),
    country: z.string().trim().min(1).max(100),
    phone: z.string().trim().min(1).max(40),
  }).strict(),
  paymentReference: z.string().trim().min(1).max(100),
}).strict();

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export function getRequestedQuantityByProduct(
  items: CreateOrderInput['items']
): Map<string, number> {
  const quantities = new Map<string, number>();
  for (const item of items) {
    quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  }
  return quantities;
}

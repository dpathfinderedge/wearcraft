export const MAX_ORDER_ITEM_QUANTITY = 20;

export function capOrderItemQuantity(quantity: number): number {
  return Math.min(MAX_ORDER_ITEM_QUANTITY, Math.max(1, Math.floor(quantity)));
}

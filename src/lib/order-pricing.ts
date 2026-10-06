export function calculateTax(subtotal: number, taxRate = 0.085): number {
  return Number((subtotal * taxRate).toFixed(2));
}

export function calculateShipping(subtotal: number, freeShippingThreshold = 100): number {
  return subtotal >= freeShippingThreshold ? 0 : 10;
}

export function calculateOrderTotals(subtotal: number) {
  const normalizedSubtotal = Number(subtotal.toFixed(2));
  const shipping = calculateShipping(normalizedSubtotal);
  const tax = calculateTax(normalizedSubtotal);

  return {
    subtotal: normalizedSubtotal,
    shipping,
    tax,
    total: Number((normalizedSubtotal + shipping + tax).toFixed(2)),
  };
}

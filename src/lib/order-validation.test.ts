import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createOrderSchema, getRequestedQuantityByProduct } from './order-validation';

const validOrder = {
  items: [{ productId: 'product-1', quantity: 2, size: 'M', color: 'Olive' }],
  address: {
    firstName: 'Rae',
    lastName: 'Smith',
    address: '12 Market Street',
    city: 'Lagos',
    state: 'Lagos',
    zipCode: '100001',
    country: 'Nigeria',
    phone: '+234 800 000 0000',
  },
  paymentReference: 'paystack-reference-123',
};

test('accepts a complete order request with a payment reference', () => {
  assert.deepEqual(createOrderSchema.parse(validOrder), validOrder);
});

test('rejects unpaid orders, empty references, and client-controlled fields', () => {
  for (const input of [
    { ...validOrder, paymentReference: undefined },
    { ...validOrder, paymentReference: ' ' },
    { ...validOrder, userId: 'another-user' },
    { ...validOrder, address: { ...validOrder.address, isDefault: true } },
    { ...validOrder, items: [{ ...validOrder.items[0], price: 1 }] },
  ]) {
    assert.equal(createOrderSchema.safeParse(input).success, false);
  }
});

test('totals requested quantities across variants for stock checks', () => {
  assert.deepEqual(
    getRequestedQuantityByProduct([
      { productId: 'product-1', quantity: 3, size: 'M', color: 'Olive' },
      { productId: 'product-1', quantity: 2, size: 'L', color: 'Olive' },
      { productId: 'product-2', quantity: 4 },
    ]),
    new Map([
      ['product-1', 5],
      ['product-2', 4],
    ])
  );
});

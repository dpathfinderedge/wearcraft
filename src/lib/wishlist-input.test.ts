import assert from 'node:assert/strict';
import { test } from 'node:test';
import { wishlistRequestSchema } from './wishlist-input';

test('accepts product IDs with the existing optional product name', () => {
  assert.deepEqual(
    wishlistRequestSchema.parse({ productId: 'product-123', productName: ' Linen Shirt ' }),
    { productId: 'product-123', productName: 'Linen Shirt' }
  );
});

test('accepts a product name for legacy callers', () => {
  assert.deepEqual(
    wishlistRequestSchema.parse({ productName: 'Linen Shirt' }),
    { productName: 'Linen Shirt' }
  );
});

test('rejects requests without a product identifier', () => {
  const result = wishlistRequestSchema.safeParse({});
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.issues[0]?.message, 'A product is required');
  }
});

test('rejects invalid identifier types and oversized values', () => {
  for (const input of [
    { productId: 123 },
    { productId: ' ' },
    { productId: 'x'.repeat(101) },
    { productName: 'x'.repeat(201) },
  ]) {
    assert.equal(wishlistRequestSchema.safeParse(input).success, false);
  }
});

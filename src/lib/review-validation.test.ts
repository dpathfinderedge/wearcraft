import assert from 'node:assert/strict';
import { test } from 'node:test';
import { reviewInputSchema, reviewLookupQuerySchema } from './review-validation';

test('validates and normalizes optional product review lookup names', () => {
  assert.deepEqual(reviewLookupQuerySchema.parse({}), {});
  assert.deepEqual(reviewLookupQuerySchema.parse({ name: ' Linen Shirt ' }), {
    name: 'Linen Shirt',
  });

  for (const query of [
    { name: ' ' },
    { name: 'n'.repeat(121) },
    { unexpected: 'value' },
  ]) {
    assert.equal(reviewLookupQuerySchema.safeParse(query).success, false);
  }
});

test('validates and normalizes review submissions', () => {
  assert.deepEqual(reviewInputSchema.parse({
    productName: ' Linen Shirt ',
    rating: 5,
    title: ' Excellent fit ',
    comment: '  Comfortable fabric and a great fit.  ',
  }), {
    productName: 'Linen Shirt',
    rating: 5,
    title: 'Excellent fit',
    comment: 'Comfortable fabric and a great fit.',
  });

  for (const input of [
    { productName: 'n'.repeat(121), rating: 5, title: 'Great fit', comment: 'Comfortable fabric and a great fit.' },
    { rating: 5, title: 'Great fit', comment: 'Comfortable fabric and a great fit.', published: true },
  ]) {
    assert.equal(reviewInputSchema.safeParse(input).success, false);
  }
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { productListQuerySchema } from './product-query';

test('applies defaults and parses valid product listing filters', () => {
  assert.deepEqual(productListQuerySchema.parse({}), {
    search: '',
    sort: 'featured',
    page: 1,
    limit: 20,
  });

  assert.deepEqual(productListQuerySchema.parse({
    category: 'womens',
    search: ' linen ',
    minPrice: '12.50',
    maxPrice: '120',
    size: ' M ',
    featured: 'false',
    sort: 'price-low',
    page: '2',
    limit: '100',
  }), {
    category: 'womens',
    search: 'linen',
    minPrice: 12.5,
    maxPrice: 120,
    size: 'M',
    featured: false,
    sort: 'price-low',
    page: 2,
    limit: 100,
  });
});

test('rejects invalid, unbounded, or contradictory product listing filters', () => {
  for (const query of [
    { category: 'children' },
    { search: 's'.repeat(121) },
    { minPrice: '-1' },
    { minPrice: 'NaN' },
    { minPrice: '12abc' },
    { minPrice: '20', maxPrice: '10' },
    { size: ' ' },
    { featured: 'yes' },
    { sort: 'random' },
    { page: '0' },
    { page: '10001' },
    { limit: '101' },
    { unexpected: 'value' },
  ]) {
    assert.equal(productListQuerySchema.safeParse(query).success, false);
  }
});

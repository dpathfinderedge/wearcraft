import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isPaystackConfigured } from './payment-config';

test('requires both PayStack public and secret keys for checkout readiness', () => {
  assert.equal(isPaystackConfigured(undefined, 'secret'), false);
  assert.equal(isPaystackConfigured('public', undefined), false);
  assert.equal(isPaystackConfigured(' ', 'secret'), false);
  assert.equal(isPaystackConfigured('public', ' '), false);
  assert.equal(isPaystackConfigured('public', 'secret'), true);
});

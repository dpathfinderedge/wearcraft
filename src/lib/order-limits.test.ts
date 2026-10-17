import assert from 'node:assert/strict';
import { test } from 'node:test';
import { capOrderItemQuantity, MAX_ORDER_ITEM_QUANTITY } from './order-limits';

test('caps cart item quantities to the server order limit', () => {
  assert.equal(capOrderItemQuantity(1), 1);
  assert.equal(capOrderItemQuantity(3.8), 3);
  assert.equal(capOrderItemQuantity(MAX_ORDER_ITEM_QUANTITY), MAX_ORDER_ITEM_QUANTITY);
  assert.equal(capOrderItemQuantity(MAX_ORDER_ITEM_QUANTITY + 1), MAX_ORDER_ITEM_QUANTITY);
  assert.equal(capOrderItemQuantity(0), 1);
});

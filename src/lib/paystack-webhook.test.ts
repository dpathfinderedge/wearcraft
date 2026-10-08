import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { test } from 'node:test';
import { createPaystackWebhookHandler } from './paystack-webhook';

const secret = 'test_webhook_secret';
const reference = 'test-payment-reference';
const order = {
  id: 'test-order-id',
  total: 125,
  user: { email: 'shopper@example.com' },
};
const successfulEvent = {
  event: 'charge.success',
  data: {
    status: 'success',
    reference,
    amount: 12500,
    currency: 'NGN',
    customer: { email: 'shopper@example.com' },
  },
};

function sign(raw: string, signingSecret = secret): string {
  return createHmac('sha512', signingSecret).update(raw).digest('hex');
}

function signedRequest(raw: string, signature = sign(raw)): Request {
  return new Request('http://localhost/api/paystack/webhook', {
    method: 'POST',
    headers: { 'x-paystack-signature': signature },
    body: raw,
  });
}

function createTestHandler({
  getSecret = () => secret,
  findOrder = async () => order,
  markOrderPaid = async () => {},
  logger = { error: () => {} },
}: {
  getSecret?: () => string | undefined;
  findOrder?: (paymentReference: string) => Promise<typeof order | null>;
  markOrderPaid?: (orderId: string, paymentReference: string) => Promise<void>;
  logger?: Pick<Console, 'error'>;
} = {}) {
  return createPaystackWebhookHandler({
    getSecret,
    findOrder,
    markOrderPaid,
    logger,
  });
}

test('returns a configuration error without looking up an order when the secret is missing', async () => {
  let orderLookupCount = 0;
  let loggedConfigurationError = false;
  const handler = createTestHandler({
    getSecret: () => undefined,
    findOrder: async () => {
      orderLookupCount += 1;
      return order;
    },
    logger: {
      error: (message) => {
        loggedConfigurationError = message.includes('PAYSTACK_SECRET_KEY');
      },
    },
  });
  const raw = JSON.stringify(successfulEvent);

  const response = await handler(signedRequest(raw));

  assert.equal(response.status, 503);
  assert.equal(orderLookupCount, 0);
  assert.equal(loggedConfigurationError, true);
});

test('rejects missing, malformed, and invalid signatures before looking up an order', async (t) => {
  const raw = JSON.stringify(successfulEvent);
  const invalidSignatures = [
    ['missing signature', ''],
    ['malformed signature', 'not-a-signature'],
    ['validly-shaped but incorrect signature', '0'.repeat(128)],
  ] as const;

  for (const [name, signature] of invalidSignatures) {
    await t.test(name, async () => {
      let orderLookupCount = 0;
      const handler = createTestHandler({
        findOrder: async () => {
          orderLookupCount += 1;
          return order;
        },
      });

      const response = await handler(signedRequest(raw, signature));

      assert.equal(response.status, 401);
      assert.equal(orderLookupCount, 0);
    });
  }
});

test('rejects signed malformed JSON', async () => {
  const raw = '{';
  const response = await createTestHandler()(signedRequest(raw));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: 'Invalid JSON body',
  });
});

test('rejects invalid signed event and charge payloads', async (t) => {
  const invalidPayloads: Array<[string, unknown]> = [
    ['missing event name', { data: successfulEvent.data }],
    ['missing charge reference', {
      event: 'charge.success',
      data: { ...successfulEvent.data, reference: '' },
    }],
    ['invalid customer email', {
      event: 'charge.success',
      data: { ...successfulEvent.data, customer: { email: 'not-an-email' } },
    }],
  ];

  for (const [name, payload] of invalidPayloads) {
    await t.test(name, async () => {
      let orderLookupCount = 0;
      const handler = createTestHandler({
        findOrder: async () => {
          orderLookupCount += 1;
          return order;
        },
      });

      const response = await handler(signedRequest(JSON.stringify(payload)));

      assert.equal(response.status, 400);
      assert.equal(orderLookupCount, 0);
    });
  }
});

test('acknowledges unrelated and unsuccessful charge events without looking up an order', async () => {
  let orderLookupCount = 0;
  const handler = createTestHandler({
    findOrder: async () => {
      orderLookupCount += 1;
      return order;
    },
  });
  const events = [
    { event: 'transfer.success', data: {} },
    {
      ...successfulEvent,
      data: { ...successfulEvent.data, status: 'failed' },
    },
  ];

  for (const event of events) {
    const response = await handler(signedRequest(JSON.stringify(event)));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      success: true,
      data: { ok: true },
      message: 'Event ignored',
    });
  }
  assert.equal(orderLookupCount, 0);
});

test('returns a retryable response when the order has not been created', async () => {
  const handler = createTestHandler({ findOrder: async () => null });
  const response = await handler(signedRequest(JSON.stringify(successfulEvent)));

  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /PayStack may retry this event/);
});

test('rejects amount, currency, and customer mismatches without updating the order', async (t) => {
  const mismatches: Array<[string, typeof successfulEvent.data]> = [
    ['amount', { ...successfulEvent.data, amount: 12499 }],
    ['currency', { ...successfulEvent.data, currency: 'USD' }],
    ['customer', {
      ...successfulEvent.data,
      customer: { email: 'someone-else@example.com' },
    }],
  ];

  for (const [name, data] of mismatches) {
    await t.test(name, async () => {
      let updateCount = 0;
      const loggerMessages: string[] = [];
      const handler = createTestHandler({
        markOrderPaid: async () => {
          updateCount += 1;
        },
        logger: {
          error: (message) => loggerMessages.push(message),
        },
      });

      const response = await handler(signedRequest(JSON.stringify({
        event: 'charge.success',
        data,
      })));

      assert.equal(response.status, 409);
      assert.equal(updateCount, 0);
      assert.equal(loggerMessages.length, 1);
      assert.match(loggerMessages[0], /does not match the order/);
    });
  }
});

test('finalizes a valid signed charge with the matching order reference', async () => {
  const updates: Array<{ orderId: string; paymentReference: string }> = [];
  const handler = createTestHandler({
    markOrderPaid: async (orderId, paymentReference) => {
      updates.push({ orderId, paymentReference });
    },
  });

  const response = await handler(signedRequest(JSON.stringify(successfulEvent)));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    data: { ok: true },
    message: 'Payment is finalized',
  });
  assert.deepEqual(updates, [{ orderId: order.id, paymentReference: reference }]);
});

test('repeated signed delivery remains successful and applies the paid transition only once', async () => {
  let paymentStatus: 'PENDING' | 'PAID' = 'PENDING';
  let updateAttempts = 0;
  let paidTransitions = 0;
  const handler = createTestHandler({
    markOrderPaid: async () => {
      updateAttempts += 1;
      if (paymentStatus !== 'PAID') {
        paymentStatus = 'PAID';
        paidTransitions += 1;
      }
    },
  });
  const raw = JSON.stringify(successfulEvent);

  const firstResponse = await handler(signedRequest(raw));
  const secondResponse = await handler(signedRequest(raw));

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 200);
  assert.equal(updateAttempts, 2);
  assert.equal(paidTransitions, 1);
  assert.equal(paymentStatus, 'PAID');
});

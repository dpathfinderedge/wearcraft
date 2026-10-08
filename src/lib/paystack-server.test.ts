import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  matchesPaystackPayment,
  PaystackVerificationError,
  verifyPaystackTransaction,
} from './paystack-server';

const transaction = {
  reference: 'payment-reference-123',
  status: 'success',
  amount: 12500,
  currency: 'NGN',
  customer: { email: 'shopper@example.com' },
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

async function withPaystackMocks(
  secretKey: string | undefined,
  fetchMock: typeof fetch,
  run: () => Promise<void>
): Promise<void> {
  const previousSecretKey = process.env.PAYSTACK_SECRET_KEY;
  const previousFetch = globalThis.fetch;
  if (secretKey === undefined) {
    delete process.env.PAYSTACK_SECRET_KEY;
  } else {
    process.env.PAYSTACK_SECRET_KEY = secretKey;
  }
  globalThis.fetch = fetchMock;

  try {
    await run();
  } finally {
    if (previousSecretKey === undefined) {
      delete process.env.PAYSTACK_SECRET_KEY;
    } else {
      process.env.PAYSTACK_SECRET_KEY = previousSecretKey;
    }
    globalThis.fetch = previousFetch;
  }
}

async function expectVerificationError(
  run: () => Promise<unknown>,
  expectedStatus: number
): Promise<void> {
  await assert.rejects(run, (error: unknown) => {
    assert.ok(error instanceof PaystackVerificationError);
    assert.equal(error.status, expectedStatus);
    return true;
  });
}

test('verifies a successful transaction using the encoded reference and secret key', async () => {
  await withPaystackMocks(
    'test_secret_key',
    async (input, init) => {
      assert.equal(
        String(input),
        'https://api.paystack.co/transaction/verify/payment%2Freference'
      );
      assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer test_secret_key');
      return jsonResponse({
        status: 'success',
        data: { ...transaction, reference: 'payment/reference' },
      });
    },
    async () => {
      const verified = await verifyPaystackTransaction('payment/reference');
      assert.deepEqual(verified, { ...transaction, reference: 'payment/reference' });
    }
  );
});

test('requires a configured secret key without making a provider request', async () => {
  let requestMade = false;
  await withPaystackMocks(
    undefined,
    async () => {
      requestMade = true;
      return jsonResponse({});
    },
    async () => {
      await expectVerificationError(
        () => verifyPaystackTransaction(transaction.reference),
        503
      );
      assert.equal(requestMade, false);
    }
  );
});

test('maps an unknown provider reference to a payment error', async () => {
  await withPaystackMocks(
    'test_secret_key',
    async () => new Response(null, { status: 404 }),
    () => expectVerificationError(
      () => verifyPaystackTransaction(transaction.reference),
      402
    )
  );
});

test('reports provider network failures as temporary verification errors', async () => {
  await withPaystackMocks(
    'test_secret_key',
    async () => {
      throw new Error('network unavailable');
    },
    () => expectVerificationError(
      () => verifyPaystackTransaction(transaction.reference),
      502
    )
  );
});

test('rejects invalid provider response bodies', async () => {
  await withPaystackMocks(
    'test_secret_key',
    async () => new Response('not-json'),
    () => expectVerificationError(
      () => verifyPaystackTransaction(transaction.reference),
      502
    )
  );
});

test('rejects transactions that have not succeeded', async () => {
  await withPaystackMocks(
    'test_secret_key',
    async () => jsonResponse({
      status: 'success',
      data: { ...transaction, status: 'failed' },
    }),
    () => expectVerificationError(
      () => verifyPaystackTransaction(transaction.reference),
      402
    )
  );
});

test('rejects a provider response for a different payment reference', async () => {
  await withPaystackMocks(
    'test_secret_key',
    async () => jsonResponse({
      status: 'success',
      data: { ...transaction, reference: 'different-reference' },
    }),
    () => expectVerificationError(
      () => verifyPaystackTransaction(transaction.reference),
      409
    )
  );
});

test('matches only the expected amount, NGN currency, and customer email', () => {
  assert.equal(
    matchesPaystackPayment(
      transaction,
      125,
      'SHOPPER@example.com'
    ),
    true
  );
  assert.equal(matchesPaystackPayment(transaction, 124.99, 'shopper@example.com'), false);
  assert.equal(
    matchesPaystackPayment({ ...transaction, currency: 'USD' }, 125, 'shopper@example.com'),
    false
  );
  assert.equal(
    matchesPaystackPayment(
      { ...transaction, customer: { email: 'other@example.com' } },
      125,
      'shopper@example.com'
    ),
    false
  );
});

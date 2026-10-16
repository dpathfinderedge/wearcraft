import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getJwtSecret } from './jwt-secret';

async function withJwtSecret(
  secret: string | undefined,
  run: () => void
): Promise<void> {
  const previousSecret = process.env.JWT_SECRET;
  if (secret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = secret;
  }

  try {
    run();
  } finally {
    if (previousSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousSecret;
    }
  }
}

test('rejects a missing JWT secret', async () => {
  await withJwtSecret(undefined, () => {
    assert.throws(
      () => getJwtSecret(),
      /JWT_SECRET must be configured with at least 32 bytes/
    );
  });
});

test('rejects a JWT secret shorter than 32 UTF-8 bytes', async () => {
  await withJwtSecret('not-long-enough', () => {
    assert.throws(
      () => getJwtSecret(),
      /JWT_SECRET must be configured with at least 32 bytes/
    );
  });
});

test('accepts a configured JWT secret of at least 32 UTF-8 bytes', async () => {
  const secret = 'a'.repeat(32);
  await withJwtSecret(secret, () => {
    assert.deepEqual(getJwtSecret(), new TextEncoder().encode(secret));
  });
});

test('measures JWT secret strength using UTF-8 bytes', async () => {
  await withJwtSecret('é'.repeat(16), () => {
    assert.equal(new TextEncoder().encode(process.env.JWT_SECRET).byteLength, 32);
    assert.equal(getJwtSecret().byteLength, 32);
  });
});

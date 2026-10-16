import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  handleApiError,
  InvalidRequestBodyError,
  parseBody,
} from './api-response';

test('converts malformed JSON bodies to a client validation error', async () => {
  let thrownError: unknown;
  try {
    await parseBody(new Request('http://localhost/api/test', {
      method: 'POST',
      body: '{"invalid":',
    }));
  } catch (error) {
    thrownError = error;
  }

  assert.ok(thrownError instanceof InvalidRequestBodyError);
  assert.equal(thrownError.message, 'Invalid JSON in request body');

  const response = handleApiError(thrownError);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: 'Invalid JSON in request body',
  });
});

test('does not log malformed client JSON as an unexpected API error', async () => {
  const originalError = console.error;
  let logged = false;
  console.error = () => {
    logged = true;
  };

  try {
    const response = handleApiError(new InvalidRequestBodyError());
    assert.equal(response.status, 400);
    assert.equal(logged, false);
  } finally {
    console.error = originalError;
  }
});

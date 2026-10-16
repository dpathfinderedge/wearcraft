import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  handleApiError,
  InvalidMultipartFormDataError,
  InvalidRequestBodyError,
  parseBody,
  parseFormData,
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

test('returns a client validation error for malformed multipart form data', async () => {
  const request = new Request('http://localhost/api/upload', {
    method: 'POST',
    headers: { 'content-type': 'multipart/form-data; boundary=wearcraft' },
    body: 'not a multipart body',
  });

  let thrownError: unknown;
  try {
    await parseFormData(request);
  } catch (error) {
    thrownError = error;
  }

  assert.ok(thrownError instanceof InvalidMultipartFormDataError);
  const response = handleApiError(thrownError);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: 'Invalid multipart form data',
  });
});

test('rejects multipart requests without a boundary', async () => {
  const request = new Request('http://localhost/api/upload', {
    method: 'POST',
    headers: { 'content-type': 'multipart/form-data' },
    body: 'anything',
  });

  await assert.rejects(
    parseFormData(request),
    InvalidMultipartFormDataError
  );
});

test('parses valid multipart form data', async () => {
  const formData = new FormData();
  formData.append('files', 'image payload');
  const request = new Request('http://localhost/api/upload', {
    method: 'POST',
    body: formData,
  });

  const parsedFormData = await parseFormData(request);
  assert.deepEqual(parsedFormData.getAll('files'), ['image payload']);
});

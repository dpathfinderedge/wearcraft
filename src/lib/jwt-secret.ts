const MINIMUM_SECRET_BYTES = 32;

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || new TextEncoder().encode(secret).byteLength < MINIMUM_SECRET_BYTES) {
    throw new Error('JWT_SECRET must be configured with at least 32 bytes.');
  }

  return new TextEncoder().encode(secret);
}

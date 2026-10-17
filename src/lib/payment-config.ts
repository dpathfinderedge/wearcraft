export function isPaystackConfigured(
  publicKey: string | undefined,
  secretKey: string | undefined
): boolean {
  return Boolean(publicKey?.trim() && secretKey?.trim());
}

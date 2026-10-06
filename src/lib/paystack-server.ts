import { z } from 'zod';

const paystackTransactionSchema = z.object({
  status: z.literal('success'),
  message: z.string().optional(),
  data: z.object({
    reference: z.string().min(1),
    status: z.string(),
    amount: z.number().int().nonnegative(),
    currency: z.string(),
    customer: z.object({
      email: z.string().email(),
    }),
  }),
});

export type VerifiedPaystackTransaction = z.infer<
  typeof paystackTransactionSchema
>['data'];

export class PaystackVerificationError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'PaystackVerificationError';
  }
}

export async function verifyPaystackTransaction(
  reference: string
): Promise<VerifiedPaystackTransaction> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new PaystackVerificationError(
      'PayStack is not configured. PAYSTACK_SECRET_KEY is required.',
      503
    );
  }

  let response: Response;
  try {
    response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${secret}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      }
    );
  } catch {
    throw new PaystackVerificationError('Unable to reach PayStack to verify payment.', 502);
  }

  if (!response.ok) {
    throw new PaystackVerificationError(
      response.status === 400 || response.status === 404
        ? 'PayStack could not find this payment reference.'
        : `PayStack verification is temporarily unavailable (status ${response.status}).`,
      response.status === 400 || response.status === 404 ? 402 : 502
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new PaystackVerificationError('PayStack returned an invalid verification response.', 502);
  }
  const parsed = paystackTransactionSchema.safeParse(json);
  if (!parsed.success) {
    throw new PaystackVerificationError('PayStack returned an invalid verification response.', 502);
  }
  if (parsed.data.data.status !== 'success') {
    throw new PaystackVerificationError('Payment has not completed successfully.', 402);
  }
  if (parsed.data.data.reference !== reference) {
    throw new PaystackVerificationError('PayStack returned a different payment reference.', 409);
  }

  return parsed.data.data;
}

export function matchesPaystackPayment(
  transaction: Pick<VerifiedPaystackTransaction, 'amount' | 'currency' | 'customer'>,
  expectedAmount: number,
  expectedEmail: string
): boolean {
  return transaction.amount === Math.round(expectedAmount * 100)
    && transaction.currency === 'NGN'
    && transaction.customer.email.toLowerCase() === expectedEmail.toLowerCase();
}

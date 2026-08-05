import { generateOrderNumber } from './utils';

interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number; // in kobo (smallest currency unit)
  currency?: string;
  reference?: string;
  onSuccess: (reference: any) => void;
  onClose: () => void;
}

/**
 * Initialize PayStack payment
 * Note: This requires the PayStack inline script to be loaded
 */
export const initializePaystackPayment = (config: PaystackConfig) => {
  // Check if PaystackPop is available
  if (typeof window === 'undefined' || !(window as any).PaystackPop) {
    console.error('PayStack script not loaded');
    return;
  }

  const handler = (window as any).PaystackPop.setup({
    key: config.publicKey,
    email: config.email,
    amount: config.amount,
    currency: config.currency || 'NGN',
    ref: config.reference || generateOrderNumber(),
    onClose: config.onClose,
    callback: config.onSuccess,
  });

  handler.openIframe();
};

/**
 * Convert dollar amount to kobo (cents)
 */
export const convertToKobo = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Get PayStack public key from environment
 */
export const getPaystackPublicKey = (): string => {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_default_key';
};

/**
 * Mock payment verification (in production, this should be done on the server)
 */
export const verifyPayment = async (reference: string): Promise<boolean> => {
  // In production, this should call your backend API
  // which verifies the payment with PayStack
  
  // Mock successful verification
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
};
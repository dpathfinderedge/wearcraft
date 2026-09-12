import { generateOrderNumber } from './utils';

interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  onSuccess: (reference: PaystackCallbackData) => void;
  onClose: () => void;
}

interface PaystackCallbackData {
  status: string;
  reference: string;
  [key: string]: unknown;
}

interface PaystackHandler {
  openIframe: () => void;
}

interface PaystackPop {
  setup: (config: {
    key: string;
    email: string;
    amount: number;
    currency: string;
    ref: string;
    onClose: () => void;
    callback: (reference: PaystackCallbackData) => void;
  }) => PaystackHandler;
}

declare global {
  interface Window {
    PaystackPop?: PaystackPop;
  }
}


export const initializePaystackPayment = (config: PaystackConfig) => {
  if (typeof window === 'undefined' || !window.PaystackPop) {
    console.error('PayStack script not loaded');
    return;
  }

  try {
    const handler = window.PaystackPop.setup({
      key: config.publicKey,
      email: config.email,
      amount: config.amount,
      currency: config.currency || 'NGN',
      ref: config.reference || generateOrderNumber(),
      onClose: config.onClose,
      callback: function paystackCallback(response) {
        config.onSuccess(response);
      },
    });

    handler.openIframe();
  } catch (error) {
    console.error('PayStack initialization failed:', error);
    config.onClose();
  }
};


export const convertToKobo = (amount: number): number => {
  return Math.round(amount * 100);
};


export const getPaystackPublicKey = (): string => {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_default_key';
};

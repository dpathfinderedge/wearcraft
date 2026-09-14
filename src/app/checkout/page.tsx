'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, useAuthStore } from '@/store';
import { CheckoutForm, OrderSummary } from '@/components/checkout';
import { Button, LoadingOverlay } from '@/components/ui';
import { AddressInput } from '@/lib/validations';
import { useToast } from '@/components/ui';
import { initializePaystackPayment, convertToKobo, getPaystackPublicKey } from '@/lib/paystack';
import { ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface PaystackResponse {
  status: string;
  reference: string;
  message?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { items, getCartSummary, clearCart } = useCartStore();
  const { user, isAuthenticated, hasCheckedAuth } = useAuthStore();

  const [shippingAddress, setShippingAddress] = useState<AddressInput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [shippingSaved, setShippingSaved] = useState(false);

  const summary = getCartSummary();
  const paystackPublicKey = getPaystackPublicKey();
  const hasValidPaystackKey = Boolean(
    paystackPublicKey && paystackPublicKey !== 'pk_test_default_key'
  );
  const amountInKobo = convertToKobo(summary.total);
  const handlePaystackLoad = useCallback(() => {
    setPaystackLoaded(true);
  }, []);
  const handlePaystackError = useCallback(() => {
    showToast('Unable to load PayStack. Demo checkout will still work.', 'warning');
  }, [showToast]);

  useEffect(() => {
    if (!hasCheckedAuth) {
      return;
    }

    if (!isAuthenticated) {
      showToast('Please login to continue', 'error');
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      router.push('/cart');
    }
  }, [hasCheckedAuth, isAuthenticated, items.length, router, showToast]);

  const handleFormSubmit = (data: AddressInput) => {
    setShippingAddress(data);
    setShippingSaved(true);
    showToast('Address saved successfully. You can now complete payment.', 'success');
  };

  const createOrder = async (paymentReference?: string) => {
    if (!user || !shippingAddress) {
      return { success: false, error: 'Missing user or shipping address' };
    }

    const orderResponse = await apiClient.createOrder({
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        image: item.product.images[0],
      })),
      address: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        address: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
      },
      subtotal: summary.subtotal,
      shipping: summary.shipping,
      tax: summary.tax,
      total: summary.total,
      paymentMethod: hasValidPaystackKey ? 'paystack' : 'card',
      paymentReference: paymentReference,
      notes: paymentReference ? `Paystack reference: ${paymentReference}` : undefined,
    });

    return orderResponse;
  };

  const handlePaystackSuccess = async (paystackResponse: PaystackResponse) => {
    setIsProcessing(true);

    try {
      const verification = await apiClient.verifyPaystackPayment(paystackResponse.reference);
      if (!verification.success) {
        throw new Error(verification.error || 'Payment verification failed');
      }

      const orderResponse = await createOrder(paystackResponse.reference);
      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(orderResponse.error || 'Order creation failed after payment');
      }

      clearCart();
      router.push(`/order-confirmation?orderId=${orderResponse.data.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to complete payment';
      showToast(errorMessage, 'error');
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!shippingAddress) {
      showToast('Please save your shipping address before paying.', 'error');
      return;
    }

    if (!user) {
      showToast('Please login to continue.', 'error');
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    if (hasValidPaystackKey) {
      if (!paystackLoaded || !window.PaystackPop) {
        showToast('Payment system is loading, please wait.', 'warning');
        return;
      }

      initializePaystackPayment({
        publicKey: paystackPublicKey,
        email: user.email,
        amount: amountInKobo,
        currency: 'NGN',
        onClose: () => {
          setIsProcessing(false);
          showToast('Payment window closed. You can retry when ready.', 'warning');
        },
        onSuccess: (response: PaystackResponse) => {
          void handlePaystackSuccess(response);
        },
      });
    } else {
      setIsProcessing(true);
      const orderResponse = await createOrder();
      if (!orderResponse.success || !orderResponse.data) {
        showToast(orderResponse.error || 'Failed to place order', 'error');
        setIsProcessing(false);
        return;
      }

      clearCart();
      router.push(`/order-confirmation?orderId=${orderResponse.data.id}`);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {isProcessing && <LoadingOverlay message="Processing your order..." />}

      <div className="min-h-screen bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-10">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-brown">Almost yours</p>
            <h1 className="mb-2 text-4xl font-light tracking-[-0.04em] text-ink md:text-5xl">Checkout</h1>
            <p className="text-muted">Complete your purchase securely.</p>
          </div>

          {!hasValidPaystackKey && (
            <div className="mb-6 rounded-md border border-[#d8cbbd] bg-[#f5efe9] p-4 text-sm text-ink">
              <strong>Demo Mode:</strong> PayStack is not configured. You can still place a test order.
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="rounded-md border border-line bg-white p-6 sm:p-8 lg:col-span-2">
              <CheckoutForm
                onSubmit={handleFormSubmit}
                defaultValues={{
                  firstName: shippingAddress?.firstName || '',
                  lastName: shippingAddress?.lastName || '',
                  street: shippingAddress?.street || '',
                  city: shippingAddress?.city || '',
                  state: shippingAddress?.state || '',
                  postalCode: shippingAddress?.postalCode || '',
                  country: shippingAddress?.country || 'Nigeria',
                  phone: shippingAddress?.phone || '',
                }}
                isLoading={isProcessing}
                loadPaystackScript={hasValidPaystackKey}
                onPaystackLoad={handlePaystackLoad}
                onPaystackError={handlePaystackError}
              />

              <div className="mt-10 border-t border-line pt-8">
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-brown">Step three</p>
                <h3 className="mb-4 text-2xl font-light tracking-[-0.03em] text-ink">Payment method</h3>
                <div className="flex items-center gap-3 rounded-md border border-line bg-paper p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#eee8df]">
                    <ShieldCheck size={24} className="text-brown" />
                  </div>
                  <div>
                    <p className="font-medium text-ink">
                      {hasValidPaystackKey ? 'PayStack Checkout' : 'Test Checkout'}
                    </p>
                    <p className="text-sm leading-6 text-muted">
                      {hasValidPaystackKey
                        ? 'Secure payment via PayStack. Your card information stays encrypted.'
                        : 'Demo sales mode: payment is simulated for testing without a PayStack key.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                <OrderSummary
                  items={items}
                  subtotal={summary.subtotal}
                  shipping={summary.shipping}
                  tax={summary.tax}
                  total={summary.total}
                />

                {shippingSaved && (
                  <div className="rounded-md border border-[#cbd7c8] bg-[#edf3eb] p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-olive-dark">Shipping address saved</span>
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handlePayment}
                  disabled={isProcessing || !shippingSaved}
                  isLoading={isProcessing}
                >
                  {isProcessing ? 'Processing...' : hasValidPaystackKey ? `Pay ${summary.total.toFixed(2)}` : 'Place Order'}
                </Button>

                <p className="text-center text-xs leading-5 text-muted">
                  By completing your purchase, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

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

      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your purchase securely.</p>
          </div>

          {!hasValidPaystackKey && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-sm text-sm text-yellow-800">
              <strong>Demo Mode:</strong> PayStack is not configured. You can still place a test order.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-sm p-6">
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

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                <div className="border border-gray-300 rounded-sm p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <ShieldCheck size={24} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {hasValidPaystackKey ? 'PayStack Checkout' : 'Test Checkout'}
                    </p>
                    <p className="text-sm text-gray-600">
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
                  <div className="p-3 bg-green-50 border border-green-200 rounded-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-800">Shipping address saved</span>
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

                <p className="text-xs text-center text-gray-500">
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
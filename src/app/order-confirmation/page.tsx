'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { CheckCircle, Package, Truck, Mail } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface OrderDetail {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentRef?: string;
  createdAt: string;
  address: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  items: Array<{
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    image: string;
  }>;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      router.push('/orders');
      return;
    }

    const fetchOrder = async () => {
      const response = await apiClient.getOrder(orderId);
      if (!response.success || !response.data) {
        router.push('/orders');
        return;
      }

      setOrder(response.data as OrderDetail);
      setLoading(false);
    };

    fetchOrder();
  }, [searchParams, router]);

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">Thank you for your purchase. Your order has been received.</p>
        </div>

        <div className="bg-gray-50 rounded-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Order Number</p>
              <p className="text-base font-semibold text-gray-900">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Order Date</p>
              <p className="text-base font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Amount</p>
              <p className="text-base font-semibold text-gray-900">{formatPrice(order.total)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">What happens next?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Order Confirmation Email</h3>
                <p className="text-sm text-gray-600">You&apos;ll receive an email confirmation with your order details shortly.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Order Processing</h3>
                <p className="text-sm text-gray-600">We&apos;re preparing your items for shipment. This usually takes 1-2 business days.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Shipping & Delivery</h3>
                <p className="text-sm text-gray-600">Once shipped, you&apos;ll receive tracking information via email. Delivery typically takes 3-5 business days.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items ({order.items.length})</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                <div className="relative w-20 h-24 bg-gray-100 flex-shrink-0 overflow-hidden">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{item.color || 'Standard'} / {item.size || 'One size'}</p>
                  <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900">{order.address.firstName} {order.address.lastName}</p>
            <p>{order.address.address}</p>
            <p>{order.address.city}, {order.address.state} {order.address.zipCode}</p>
            <p>{order.address.country}</p>
            <p className="mt-2">{order.address.phone}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/orders" className="flex-1">
            <Button variant="primary" size="lg" className="w-full">View Order History</Button>
          </Link>
          <Link href="/shop" className="flex-1">
            <Button variant="outline" size="lg" className="w-full">Continue Shopping</Button>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help with your order?{' '}
            <a href="mailto:support@wearcraft.com" className="text-gray-900 underline underline-offset-2">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { Badge } from '@/components/common';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

type OrderSummaryItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
};

type OrderListItem = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentRef?: string;
  trackingNumber?: string;
  createdAt: string;
  items: OrderSummaryItem[];
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/orders');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.getOrders();
        if (response.success && response.data) {
          setOrders(response.data as OrderListItem[]);
        } else {
          setOrders([]);
          setError(response.error || 'Unable to load your orders.');
        }
      } catch (requestError) {
        setOrders([]);
        setError(requestError instanceof Error ? requestError.message : 'Unable to load your orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [hasHydrated, isAuthenticated, router]);

  if (!user) {
    return null;
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'processing':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">
            Order History
          </h1>
          <p className="text-gray-600">
            View and track your orders
          </p>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-sm text-gray-600">Loading orders...</div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 text-sm font-medium text-gray-900 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Package size={40} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-8">
              When you place orders, they&apos;ll appear here.
            </p>
            <Link
              href="/shop"
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-sm hover:bg-gray-800 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-sm transition"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Order Number
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.orderNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Date
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(order.createdAt, 'short')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Total
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Status
                        </p>
                        <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <div className="flex items-center gap-4 overflow-x-auto pb-2">
                    {order.items.slice(0, 4).map((item: OrderSummaryItem, index: number) => (
                      <div
                        key={index}
                        className="relative shrink-0 w-16 h-20 bg-gray-100 overflow-hidden"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="shrink-0 w-16 h-20 bg-gray-100 flex items-center justify-center">
                        <span className="text-sm text-gray-600 font-medium">
                          +{order.items.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>

                {/* Order Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {order.trackingNumber && (
                      <p>Tracking: <span className="font-medium text-gray-900">{order.trackingNumber}</span></p>
                    )}
                  </div>
                  <Link
                    href={`/order-confirmation?orderId=${order.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition"
                  >
                    View Details
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
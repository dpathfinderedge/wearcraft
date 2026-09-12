import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderItem, OrderStatus, CheckoutData } from '@/types/order';
import { generateId, generateOrderNumber } from '@/lib/utils';

interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (
    userId: string,
    items: OrderItem[],
    checkoutData: CheckoutData,
    summary: { subtotal: number; shipping: number; tax: number; total: number }
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addTrackingNumber: (orderId: string, trackingNumber: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByUserId: (userId: string) => Order[];
  setCurrentOrder: (order: Order | null) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      currentOrder: null,

      createOrder: (userId, items, checkoutData, summary) => {
        const newOrder: Order = {
          id: generateId(),
          userId,
          orderNumber: generateOrderNumber(),
          items,
          subtotal: summary.subtotal,
          shipping: summary.shipping,
          tax: summary.tax,
          total: summary.total,
          status: 'pending',
          paymentMethod: checkoutData.paymentMethod,
          paymentStatus: 'pending',
          shippingAddress: checkoutData.shippingAddress,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
          currentOrder: newOrder,
        }));

        return newOrder;
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                  updatedAt: new Date().toISOString(),
                }
              : order
          ),
          currentOrder:
            state.currentOrder?.id === orderId
              ? {
                  ...state.currentOrder,
                  status,
                  updatedAt: new Date().toISOString(),
                }
              : state.currentOrder,
        }));
      },

      addTrackingNumber: (orderId, trackingNumber) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  trackingNumber,
                  status: 'shipped',
                  updatedAt: new Date().toISOString(),
                }
              : order
          ),
        }));
      },

      getOrderById: (orderId) => {
        return get().orders.find((order) => order.id === orderId);
      },

      getOrdersByUserId: (userId) => {
        return get().orders.filter((order) => order.userId === userId);
      },

      setCurrentOrder: (order) => {
        set({ currentOrder: order });
      },

      clearOrders: () => {
        set({ orders: [], currentOrder: null });
      },
    }),
    {
      name: 'wearcraft-order-storage',
    }
  )
);
'use client';

import { useCartStore, useAuthStore, useOrderStore } from '@/store';
import { products } from '@/data/products';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, User, Package } from 'lucide-react';

export default function TestStoresPage() {
  // Cart Store
  const { items, addItem, removeItem, updateQuantity, clearCart, getCartSummary, getItemCount } = useCartStore();
  const cartSummary = getCartSummary();
  const itemCount = getItemCount();

  // Auth Store
  const { user, isAuthenticated, login, signup, logout } = useAuthStore();

  // Order Store
  const { orders, createOrder } = useOrderStore();

  // Handlers
  const handleAddToCart = () => {
    const product = products[0]; // Add first product
    addItem(product, 'M', 'Black', 1);
  };

  const handleLogin = async () => {
    const result = await login({ email: 'test@example.com', password: 'password123' });
    alert(result.success ? 'Login successful!' : result.error);
  };

  const handleSignup = async () => {
    const result = await signup({ 
      name: 'Test User',
      email: 'test@example.com', 
      password: 'password123' 
    });
    alert(result.success ? 'Signup successful!' : result.error);
  };

  const handleCreateOrder = () => {
    if (!user) {
      alert('Please login first!');
      return;
    }

    if (items.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const order = createOrder(
      user.id,
      items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        image: item.product.images[0],
      })),
      {
        email: user.email,
        shippingAddress: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
          phone: '+1234567890',
        },
        paymentMethod: 'paystack',
      },
      cartSummary
    );

    clearCart();
    alert(`Order created! Order #${order.orderNumber}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            State Management Test
          </h1>
          <p className="text-gray-600">
            Testing Zustand stores: Cart, Auth, and Orders
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cart Store Test */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <ShoppingCart className="mr-2" size={24} />
              <h2 className="text-xl font-semibold">Cart Store</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Items in cart:</p>
                <p className="text-2xl font-bold text-gray-900">{itemCount}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Total:</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(cartSummary.total)}
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition text-sm"
                >
                  Add Item to Cart
                </button>
                <button
                  onClick={clearCart}
                  className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-sm"
                >
                  Clear Cart
                </button>
              </div>

              {items.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Cart Items:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {items.map((item, index) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-gray-600">
                          {item.selectedSize} / {item.selectedColor} × {item.quantity}
                        </p>
                        <p className="text-gray-900 font-medium">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Auth Store Test */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <User className="mr-2" size={24} />
              <h2 className="text-xl font-semibold">Auth Store</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Status:</p>
                <p className="text-lg font-bold text-gray-900">
                  {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
                </p>
              </div>

              {user && (
                <div className="p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">User:</p>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              )}

              <div className="space-y-2">
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={handleLogin}
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition text-sm"
                    >
                      Test Login
                    </button>
                    <button
                      onClick={handleSignup}
                      className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-sm"
                    >
                      Test Signup
                    </button>
                  </>
                ) : (
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition text-sm"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Store Test */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <Package className="mr-2" size={24} />
              <h2 className="text-xl font-semibold">Order Store</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Total Orders:</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>

              <button
                onClick={handleCreateOrder}
                className="w-full px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition text-sm"
              >
                Create Order
              </button>

              {orders.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Recent Orders:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="text-xs bg-gray-50 p-2 rounded">
                        <p className="font-medium">Order #{order.orderNumber}</p>
                        <p className="text-gray-600">
                          Status: <span className="capitalize">{order.status}</span>
                        </p>
                        <p className="text-gray-900 font-medium">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-12 bg-white p-8 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ✅ Phase 3 Complete!
          </h2>
          <div className="space-y-2 text-gray-600">
            <p>✅ Cart Store - Add/remove items, calculate totals, persist cart</p>
            <p>✅ Auth Store - Login/signup/logout, manage user data</p>
            <p>✅ Order Store - Create and track orders</p>
            <p className="mt-4 text-sm text-gray-500">
              All stores use Zustand with persist middleware. Data is saved to localStorage.
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded">
            <p className="text-sm font-medium text-gray-900 mb-2">
              Test the stores:
            </p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Add items to cart (Cart Store)</li>
              <li>Login or signup (Auth Store)</li>
              <li>Create an order (Order Store)</li>
              <li>Refresh the page - data persists!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
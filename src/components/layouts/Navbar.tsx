'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';
import { useCartStore, useAuthStore } from '@/store';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
  const { getItemCount } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const cartItemCount = mounted ? getItemCount() : 0;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navigation = [
    { name: 'Shop', href: '/shop' },
    { name: 'Men', href: '/shop?category=mens' },
    { name: 'Women', href: '/shop?category=womens' },
    { name: 'Accessories', href: '/shop?category=accessories' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold tracking-tight text-gray-900">
              WearCraft
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button className="hidden md:block p-2 text-gray-700 hover:text-gray-900 transition">
              <Search size={20} strokeWidth={1.5} />
            </button>

            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-gray-900 transition">
              <ShoppingCart size={20} strokeWidth={1.5} />
              {mounted && cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {mounted && isAuthenticated && user ? (
              <div className="relative group">
                <button className="hidden md:flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 transition">
                  <User size={20} strokeWidth={1.5} />
                  <span className="text-sm font-medium">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-sm shadow-lg py-2 hidden group-hover:block border border-gray-200">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Order History
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={() => void handleLogout()}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              mounted && (
                <Link
                  href="/auth/login"
                  className="hidden md:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-900 border border-gray-300 rounded-sm hover:bg-gray-50 transition"
                >
                  <User size={16} strokeWidth={1.5} />
                  <span>Login</span>
                </Link>
              )
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {mounted && !isAuthenticated && (
              <Link
                href="/auth/login"
                className="block py-2 text-base font-medium text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
            {mounted && isAuthenticated && (
              <>
                <Link
                  href="/profile"
                  className="block py-2 text-base font-medium text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/wishlist"
                  className="block py-2 text-base font-medium text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wishlist
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-base font-medium text-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
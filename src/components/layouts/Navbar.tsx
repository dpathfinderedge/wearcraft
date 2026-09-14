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
    <nav className="sticky top-0 z-40 border-b border-line bg-[#f8f7f3]/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold tracking-[-0.04em] text-ink">
              Wear<span className="text-olive">Craft</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-xs font-medium uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button className="hidden md:block p-2 text-gray-700 hover:text-gray-900 transition">
              <Search size={19} strokeWidth={1.5} />
            </button>

            <Link href="/cart" aria-label="Shopping cart" className="relative p-2 text-muted transition-colors hover:text-ink">
              <ShoppingCart size={20} strokeWidth={1.5} />
              {mounted && cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-olive text-xs font-medium text-white">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {mounted && isAuthenticated && user ? (
              <div className="relative group">
                <button className="hidden md:flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 transition">
                  <User size={19} strokeWidth={1.5} />
                  <span className="text-sm font-medium text-ink">{user.name}</span>
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
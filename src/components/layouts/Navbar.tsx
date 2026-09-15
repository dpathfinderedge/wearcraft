'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCartStore, useAuthStore, useWishlistStore } from '@/store';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
  const { getItemCount } = useCartStore();
  const { user, isAuthenticated, hasCheckedAuth, logout } = useAuthStore();
  const { items: wishlistItems, hasLoaded: wishlistLoaded, loadWishlist } = useWishlistStore();

  const cartItemCount = mounted ? getItemCount() : 0;
  const wishlistCount = mounted ? wishlistItems.length : 0;

  useEffect(() => {
    if (mounted && hasCheckedAuth && isAuthenticated && !wishlistLoaded) {
      void loadWishlist();
    }
  }, [hasCheckedAuth, isAuthenticated, loadWishlist, mounted, wishlistLoaded]);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [accountMenuOpen]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navigation = [
    { name: 'Shop', href: '/shop' },
    { name: 'Men', href: '/shop?category=mens' },
    { name: 'Women', href: '/shop?category=womens' },
    { name: 'Accessories', href: '/shop?category=accessories' },
    { name: 'Contact', href: '/contact' },
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
            {mounted && isAuthenticated && (
              <Link href="/wishlist" aria-label="Wishlist" className="relative hidden p-2 text-muted transition-colors hover:text-ink md:block">
                <Heart size={20} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brown text-xs font-medium text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            <Link href="/cart" aria-label="Shopping cart" className="relative p-2 text-muted transition-colors hover:text-ink">
              <ShoppingCart size={20} strokeWidth={1.5} />
              {mounted && cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-olive text-xs font-medium text-white">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {mounted && isAuthenticated && user ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setAccountMenuOpen((open) => !open)}
                  className="flex items-center space-x-2 rounded-md p-2 text-gray-700 transition-colors hover:text-gray-900"
                >
                  <User size={19} strokeWidth={1.5} />
                  <span className="text-sm font-medium text-ink">{user.name}</span>
                </button>
                <div className={`absolute right-0 top-full w-52 origin-top-right pt-2 transition-all duration-200 ease-out ${accountMenuOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0 pointer-events-none'}`}>
                  <div className="rounded-md border border-line bg-white py-2 shadow-lg">
                  <Link
                    href="/profile"
                    onClick={() => setAccountMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-muted transition-colors hover:bg-paper hover:text-ink"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setAccountMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-muted transition-colors hover:bg-paper hover:text-ink"
                  >
                    Order History
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setAccountMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-muted transition-colors hover:bg-paper hover:text-ink"
                  >
                    Wishlist
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      void handleLogout();
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm text-clay transition-colors hover:bg-paper"
                  >
                    Logout
                  </button>
                  </div>
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
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="rounded-md p-2 text-muted transition-colors hover:bg-paper hover:text-ink md:hidden"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>

      <div className={`overflow-hidden border-t border-line bg-white transition-all duration-300 ease-out md:hidden ${mobileMenuOpen ? 'max-h-[32rem] opacity-100' : 'pointer-events-none max-h-0 opacity-0'}`}>
          <div className="space-y-1 px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded-md px-3 py-2.5 text-sm font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:bg-paper hover:text-ink"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {mounted && !isAuthenticated && (
              <Link
                href="/auth/login"
                className="mt-2 block rounded-md bg-brown px-3 py-2.5 text-sm font-medium uppercase tracking-[0.08em] text-white transition-colors hover:bg-brown-dark"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
            {mounted && isAuthenticated && (
              <>
                <Link
                  href="/profile"
                  className="block rounded-md px-3 py-2.5 text-sm font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:bg-paper hover:text-ink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/wishlist"
                  className="block rounded-md px-3 py-2.5 text-sm font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:bg-paper hover:text-ink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wishlist
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium uppercase tracking-[0.08em] text-clay transition-colors hover:bg-paper"
                >
                  Logout
                </button>
              </>
            )}
          </div>
          </div>
      </div>
    </nav>
  );
};
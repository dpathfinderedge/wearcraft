'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasCheckedAuth } = useAuthStore();

  useEffect(() => {
    if (hasCheckedAuth && user?.role !== 'ADMIN') {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [hasCheckedAuth, pathname, router, user?.role]);

  if (!hasCheckedAuth || user?.role !== 'ADMIN') {
    return <div className="min-h-screen bg-paper" />;
  }

  return <>{children}</>;
}

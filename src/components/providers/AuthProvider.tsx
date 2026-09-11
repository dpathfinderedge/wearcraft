'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      checkAuth();
    }
  }, [checkAuth, hasHydrated]);

  return <>{children}</>;
}
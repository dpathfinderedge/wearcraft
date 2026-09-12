'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    let hasStarted = false;
    const runAuthCheck = () => {
      if (hasStarted) {
        return;
      }

      hasStarted = true;
      void checkAuth();
    };

    if (useAuthStore.persist.hasHydrated()) {
      runAuthCheck();
    }

    const unsubscribe = useAuthStore.persist.onFinishHydration(runAuthCheck);
    return unsubscribe;
  }, [checkAuth]);

  return <>{children}</>;
}
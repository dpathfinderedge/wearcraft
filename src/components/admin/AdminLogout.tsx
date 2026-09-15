'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';

export function AdminLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return (
    <button type="button" onClick={() => void logout().then(() => router.push('/auth/login'))} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted hover:bg-paper hover:text-ink">
      <LogOut size={17} /> Sign out
    </button>
  );
}

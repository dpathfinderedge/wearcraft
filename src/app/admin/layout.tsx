import Link from 'next/link';
import { Store } from 'lucide-react';
import { AdminLogout } from '@/components/admin/AdminLogout';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminNavigation } from '@/components/admin/AdminNavigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
    <div className="min-h-screen bg-paper lg:flex">
      <aside className="w-full border-b border-line bg-white lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5 lg:block lg:px-7">
          <Link href="/admin" className="text-xl font-semibold tracking-[-0.03em] text-ink">WearCraft <span className="text-xs font-normal uppercase tracking-[0.18em] text-brown">Admin</span></Link>
          <span className="hidden text-xs text-muted lg:mt-2 lg:block">Catalogue and operations</span>
        </div>
        <AdminNavigation />
        <div className="hidden space-y-2 border-t border-line p-4 lg:block">
          <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted hover:bg-paper hover:text-ink"><Store size={17} /> View storefront</Link>
          <AdminLogout />
        </div>
      </aside>
      <div className="w-full lg:ml-64">{children}</div>
    </div>
    </AdminGuard>
  );
}

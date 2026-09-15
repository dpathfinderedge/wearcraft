import Link from 'next/link';
import { BarChart3, ClipboardList, LayoutDashboard, Package, ShieldCheck, Store, Users } from 'lucide-react';
import { AdminLogout } from '@/components/admin/AdminLogout';
import { AdminGuard } from '@/components/admin/AdminGuard';

const navigation = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/reviews', label: 'Reviews', icon: ShieldCheck },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
    <div className="min-h-screen bg-paper lg:flex">
      <aside className="w-full border-b border-line bg-white lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5 lg:block lg:px-7">
          <Link href="/admin" className="text-xl font-semibold tracking-[-0.03em] text-ink">WearCraft <span className="text-xs font-normal uppercase tracking-[0.18em] text-brown">Admin</span></Link>
          <span className="hidden text-xs text-muted lg:mt-2 lg:block">Catalogue and operations</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:flex-1 lg:space-y-1 lg:px-4 lg:py-8">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted transition-colors hover:bg-paper hover:text-ink lg:w-full">
              <Icon size={17} /> {label}
            </Link>
          ))}
        </nav>
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

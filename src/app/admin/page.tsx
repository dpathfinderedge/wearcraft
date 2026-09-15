import Link from 'next/link';
import { ArrowRight, ClipboardList, Package, ShieldCheck } from 'lucide-react';

const areas = [
  { href: '/admin/products', label: 'Products', description: 'Manage catalogue, pricing, inventory, and imagery.', icon: Package },
  { href: '/admin/orders', label: 'Orders', description: 'Review fulfilment activity and customer orders.', icon: ClipboardList },
  { href: '/admin/reviews', label: 'Reviews', description: 'Keep customer feedback useful and trustworthy.', icon: ShieldCheck },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-brown">Admin / Overview</p>
        <h1 className="text-4xl font-light tracking-[-0.04em] text-ink">Good morning</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">A quiet place to keep the WearCraft collection and customer experience in order.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {areas.map(({ href, label, description, icon: Icon }) => (
            <Link key={href} href={href} className="group border border-line bg-white p-6 transition-colors hover:border-brown">
              <Icon size={21} className="text-brown" />
              <h2 className="mt-8 text-xl font-medium text-ink">{label}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-muted">{description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-brown">Open workspace <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, CircleDollarSign, Mail, MapPin, Package, Phone, ShoppingBag, Star, UserRound } from 'lucide-react';
import { apiClient, type AdminCustomerDetail, type AdminOrderStatus, type AdminPaymentStatus } from '@/lib/api-client';
import { formatPrice } from '@/lib/utils';

const statusStyle: Record<AdminOrderStatus, string> = {
  PENDING: 'bg-[#f5f0e2] text-[#876a2e]',
  PROCESSING: 'bg-[#e9edf4] text-[#455a7d]',
  SHIPPED: 'bg-[#e8eee9] text-[#526b58]',
  DELIVERED: 'bg-[#e7efe8] text-[#42644b]',
  CANCELLED: 'bg-[#f4e9e6] text-[#995a4e]',
};

const paymentStyle: Record<AdminPaymentStatus, string> = {
  PENDING: 'bg-[#f5f0e2] text-[#876a2e]',
  PAID: 'bg-[#e7efe8] text-[#42644b]',
  FAILED: 'bg-[#f4e9e6] text-[#995a4e]',
  REFUNDED: 'bg-[#eee9f3] text-[#675477]',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

function statusName(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void apiClient.getAdminCustomer(params.id).then((response) => {
      if (cancelled) return;
      if (response.success && response.data) setCustomer(response.data);
      else setError(response.error || 'Unable to load customer.');
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [params.id]);

  if (isLoading) {
    return <main className="min-h-screen bg-[#f8f7f4] p-8"><div className="mx-auto max-w-6xl animate-pulse space-y-5"><div className="h-8 w-64 rounded-2xl bg-[#e9e7e1]" /><div className="h-36 rounded-2xl bg-white" /><div className="h-72 rounded-2xl bg-white" /></div></main>;
  }

  if (!customer) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] px-4 py-16">
        <section className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-8 text-center">
          <h1 className="text-xl font-medium text-ink">Customer unavailable</h1>
          <p className="mt-2 text-sm text-muted">{error || 'This customer could not be found.'}</p>
          <Link href="/admin/users" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brown"><ArrowLeft size={15} /> Back to customers</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <Link href="/admin/users" className="mb-7 inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-brown"><ArrowLeft size={15} /> Customer book</Link>
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-line pb-7 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-brown">Customer profile</p>
            <h1 className="text-3xl font-light tracking-[-0.04em] text-ink sm:text-4xl">{customer.firstName} {customer.lastName}</h1>
            <p className="mt-2 text-sm text-muted">Customer since {formatDate(customer.createdAt)}</p>
          </div>
          <a href={`mailto:${customer.email}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brown px-5 py-3 text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-brown-dark"><Mail size={15} /> Email customer</a>
        </header>

        <section aria-label="Customer activity summary" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-line bg-white p-5"><div className="flex items-center justify-between text-xs uppercase tracking-[0.1em] text-muted"><span>All orders</span><ShoppingBag size={17} className="text-brown" /></div><p className="mt-5 text-3xl font-light text-ink">{customer._count.orders}</p><p className="mt-2 text-xs text-muted">Lifetime order count</p></article>
          <article className="rounded-2xl border border-line bg-white p-5"><div className="flex items-center justify-between text-xs uppercase tracking-[0.1em] text-muted"><span>Paid with us</span><CircleDollarSign size={17} className="text-olive" /></div><p className="mt-5 text-3xl font-light text-ink">{formatPrice(customer.lifetimePaid)}</p><p className="mt-2 text-xs text-muted">Across {customer.paidOrderCount} verified paid orders</p></article>
          <article className="rounded-2xl border border-line bg-white p-5"><div className="flex items-center justify-between text-xs uppercase tracking-[0.1em] text-muted"><span>Product reviews</span><Star size={17} className="text-brown" /></div><p className="mt-5 text-3xl font-light text-ink">{customer._count.reviews}</p><p className="mt-2 text-xs text-muted">Feedback shared</p></article>
          <article className="rounded-2xl border border-line bg-white p-5"><div className="flex items-center justify-between text-xs uppercase tracking-[0.1em] text-muted"><span>Saved pieces</span><Package size={17} className="text-brown" /></div><p className="mt-5 text-3xl font-light text-ink">{customer._count.wishlist}</p><p className="mt-2 text-xs text-muted">Items in their wishlist</p></article>
        </section>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.7fr)]">
          <section className="overflow-hidden rounded-2xl border border-line bg-white">
            <header className="flex items-center justify-between border-b border-line px-5 py-5 sm:px-7">
              <div><p className="text-[10px] uppercase tracking-[0.16em] text-brown">History</p><h2 className="mt-1 text-lg font-medium text-ink">Recent orders</h2></div>
              <span className="text-xs text-muted">Latest {customer.orders.length} of {customer._count.orders}</span>
            </header>
            {customer.orders.length === 0 ? (
              <div className="px-6 py-16 text-center"><ShoppingBag size={28} className="mx-auto text-muted" strokeWidth={1.4} /><p className="mt-4 text-sm font-medium text-ink">No orders yet</p><p className="mt-1 text-xs text-muted">Their order history will appear here.</p></div>
            ) : (
              <div className="divide-y divide-line">
                {customer.orders.map((order) => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex flex-col gap-3 p-5 transition-colors hover:bg-[#fcfbf9] sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <div className="min-w-0"><p className="text-sm font-medium text-ink">{order.orderNumber}</p><p className="mt-1 text-xs text-muted">{formatDate(order.createdAt)} <span className="mx-1.5 text-line">·</span> {order.items.reduce((sum, item) => sum + item.quantity, 0)} pieces</p></div>
                    <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end"><span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyle[order.status]}`}>{statusName(order.status)}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${paymentStyle[order.paymentStatus]}`}>{statusName(order.paymentStatus)}</span><span className="text-sm font-medium text-ink">{formatPrice(order.total)}</span></div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2"><UserRound size={16} className="text-brown" /><h2 className="text-sm font-medium text-ink">Contact details</h2></div>
              <dl className="mt-5 space-y-4 text-sm">
                <div><dt className="text-[10px] uppercase tracking-[0.12em] text-muted">Email</dt><dd className="mt-1 break-all text-ink">{customer.email}</dd></div>
                <div><dt className="text-[10px] uppercase tracking-[0.12em] text-muted">Phone</dt><dd className="mt-1 text-ink">{customer.phone || 'Not provided'}</dd></div>
                <div><dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted"><CalendarDays size={13} /> Account created</dt><dd className="mt-1 text-ink">{formatDate(customer.createdAt)}</dd></div>
              </dl>
              <div className="mt-5 flex gap-2">
                <a href={`mailto:${customer.email}`} aria-label={`Email ${customer.firstName}`} className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted hover:border-brown hover:text-brown"><Mail size={16} /></a>
                {customer.phone && <a href={`tel:${customer.phone}`} aria-label={`Call ${customer.firstName}`} className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted hover:border-brown hover:text-brown"><Phone size={16} /></a>}
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><MapPin size={16} className="text-brown" /><h2 className="text-sm font-medium text-ink">Saved addresses</h2></div><span className="text-xs text-muted">{customer.addresses.length}</span></div>
              {customer.addresses.length === 0 ? <p className="mt-5 text-sm text-muted">No saved addresses.</p> : (
                <div className="mt-4 space-y-3">
                  {customer.addresses.map((address) => (
                    <address key={address.id} className="rounded-xl border border-line bg-[#fcfbf9] p-4 not-italic text-xs leading-5 text-muted">
                      <div className="flex items-center justify-between gap-2"><p className="font-medium text-ink">{address.firstName} {address.lastName}</p>{address.isDefault && <span className="text-[9px] uppercase tracking-[0.1em] text-olive">Default</span>}</div>
                      <p className="mt-1">{address.address}</p><p>{address.city}, {address.state} {address.zipCode}</p><p>{address.country}</p><p className="mt-1">{address.phone}</p>
                    </address>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

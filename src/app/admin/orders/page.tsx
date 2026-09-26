'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, PackageCheck, Search, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui';
import { apiClient, type AdminOrder, type AdminOrderStatus, type AdminOrdersResponse, type AdminPaymentStatus } from '@/lib/api-client';
import { formatPrice } from '@/lib/utils';

type StatusFilter = 'ALL' | AdminOrderStatus;

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All orders' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

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
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function StatusPill({ status, payment = false }: { status: AdminOrderStatus | AdminPaymentStatus; payment?: boolean }) {
  const className = payment
    ? paymentStyle[status as AdminPaymentStatus]
    : statusStyle[status as AdminOrderStatus];
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${className}`}>{formatStatus(status)}</span>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [data, setData] = useState<AdminOrdersResponse | null>(null);
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [payment, setPayment] = useState<AdminPaymentStatus | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    const response = await apiClient.getAdminOrders({
      search,
      status: status === 'ALL' ? undefined : status,
      payment: payment || undefined,
      page,
      limit: 12,
    });
    if (response.success && response.data) {
      setOrders(response.data.orders);
      setData(response.data);
      setError(null);
    } else {
      setError(response.error || 'Unable to load orders.');
    }
    setIsLoading(false);
  }, [page, payment, search, status]);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      setIsLoading(true);
      void apiClient.getAdminOrders({
        search,
        status: status === 'ALL' ? undefined : status,
        payment: payment || undefined,
        page,
        limit: 12,
      }).then((response) => {
        if (cancelled) return;
        if (response.success && response.data) {
          setOrders(response.data.orders);
          setData(response.data);
          setError(null);
        } else {
          setError(response.error || 'Unable to load orders.');
        }
        setIsLoading(false);
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [page, payment, search, status]);

  const summary = data?.summary;
  const totalPages = data?.pagination.totalPages || 1;

  return (
    <main className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-line pb-7 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
              <span>Operations</span><span className="text-line">/</span><span className="text-brown">Orders</span>
            </div>
            <h1 className="text-3xl font-light tracking-[-0.04em] text-ink sm:text-4xl">Order desk</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Follow every order from payment confirmation to the customer’s door.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted"><span className="h-2 w-2 rounded-full bg-olive" /> Live order overview</div>
        </div>

        <section aria-label="Order overview" className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="border border-line bg-white p-5">
            <div className="flex items-start justify-between"><span className="text-xs uppercase tracking-[0.1em] text-muted">All orders</span><ShoppingBag size={17} className="text-brown" /></div>
            <p className="mt-5 text-3xl font-light tracking-tight text-ink">{summary?.allOrders ?? '—'}</p>
            <p className="mt-2 text-xs text-muted">Orders recorded to date</p>
          </article>
          <article className="border border-line bg-white p-5">
            <div className="flex items-start justify-between"><span className="text-xs uppercase tracking-[0.1em] text-muted">Needs attention</span><Clock3 size={17} className="text-[#98743d]" /></div>
            <p className="mt-5 text-3xl font-light tracking-tight text-ink">{summary?.needsAttention ?? '—'}</p>
            <p className="mt-2 text-xs text-muted">Pending or being prepared</p>
          </article>
          <article className="border border-line bg-white p-5">
            <div className="flex items-start justify-between"><span className="text-xs uppercase tracking-[0.1em] text-muted">Paid revenue</span><CircleDollarSign size={17} className="text-olive" /></div>
            <p className="mt-5 text-3xl font-light tracking-tight text-ink">{summary ? formatPrice(summary.paidRevenue) : '—'}</p>
            <p className="mt-2 text-xs text-muted">Verified paid orders</p>
          </article>
          <article className="border border-line bg-white p-5">
            <div className="flex items-start justify-between"><span className="text-xs uppercase tracking-[0.1em] text-muted">Received today</span><CalendarDays size={17} className="text-brown" /></div>
            <p className="mt-5 text-3xl font-light tracking-tight text-ink">{summary?.todayOrders ?? '—'}</p>
            <p className="mt-2 text-xs text-muted">Since the start of today</p>
          </article>
        </section>

        <section className="border border-line bg-white">
          <div className="border-b border-line px-4 pt-4 sm:px-6">
            <div className="flex gap-5 overflow-x-auto" role="tablist" aria-label="Filter by fulfilment status">
              {statusFilters.map((filter) => {
                const count = filter.value === 'ALL' ? summary?.allOrders : summary?.byStatus[filter.value];
                const active = status === filter.value;
                return (
                  <button key={filter.value} type="button" role="tab" aria-selected={active} onClick={() => { setStatus(filter.value); setPage(1); }}
                    className={`flex shrink-0 items-center gap-2 border-b-2 px-1 pb-3 text-sm transition-colors ${active ? 'border-brown font-medium text-ink' : 'border-transparent text-muted hover:text-ink'}`}>
                    {filter.label}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-[#f4eee9] text-brown' : 'bg-[#f5f4f1] text-muted'}`}>{count ?? '—'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <label className="relative block w-full sm:max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input aria-label="Search orders" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Order number or customer" className="w-full border border-line bg-[#fcfbf9] py-2.5 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-olive focus:ring-1 focus:ring-olive" />
            </label>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <label className="text-xs text-muted">Payment
                <select aria-label="Filter by payment status" value={payment} onChange={(event) => { setPayment(event.target.value as AdminPaymentStatus | ''); setPage(1); }} className="ml-2 border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-olive">
                  <option value="">All</option><option value="PAID">Paid</option><option value="PENDING">Pending</option><option value="FAILED">Failed</option><option value="REFUNDED">Refunded</option>
                </select>
              </label>
              <span className="hidden text-xs text-muted md:inline">{data?.pagination.total ?? 0} results</span>
            </div>
          </div>

          {error && <div role="alert" className="m-4 border border-[#e4c9c0] bg-[#fbefeb] p-4 text-sm text-clay sm:m-6"><p>{error}</p><button type="button" onClick={() => void loadOrders()} className="mt-2 font-medium underline underline-offset-4">Retry</button></div>}

          {isLoading ? (
            <div className="space-y-3 p-6" aria-label="Loading orders">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-14 animate-pulse bg-[#f5f4f1]" />)}</div>
          ) : !error && orders.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <PackageCheck size={30} className="mx-auto text-muted" strokeWidth={1.4} />
              <h2 className="mt-4 text-lg font-medium text-ink">No orders in this view</h2>
              <p className="mt-2 text-sm text-muted">Try another status or adjust your search.</p>
            </div>
          ) : !error && (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-[#faf9f6] text-[10px] uppercase tracking-[0.12em] text-muted"><tr><th className="px-6 py-3 font-medium">Order</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Placed</th><th className="px-4 py-3 font-medium">Items</th><th className="px-4 py-3 font-medium">Total</th><th className="px-4 py-3 font-medium">Payment</th><th className="px-4 py-3 font-medium">Fulfilment</th><th className="px-5 py-3" /></tr></thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t border-line transition-colors hover:bg-[#fcfbf9]">
                        <td className="px-6 py-4"><Link href={`/admin/orders/${order.id}`} className="font-medium text-ink hover:text-brown">{order.orderNumber}</Link><p className="mt-1 text-[11px] text-muted">{order.paymentMethod}</p></td>
                        <td className="px-4 py-4"><p className="text-sm text-ink">{order.user.firstName} {order.user.lastName}</p><p className="mt-1 text-xs text-muted">{order.user.email}</p></td>
                        <td className="px-4 py-4 text-sm text-muted">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-4 text-sm text-muted">{order.items.reduce((sum, item) => sum + item.quantity, 0)} pieces</td>
                        <td className="px-4 py-4 text-sm font-medium text-ink">{formatPrice(order.total)}</td>
                        <td className="px-4 py-4"><StatusPill status={order.paymentStatus} payment /></td>
                        <td className="px-4 py-4"><StatusPill status={order.status} /></td>
                        <td className="px-5 py-4"><Link href={`/admin/orders/${order.id}`} aria-label={`View order ${order.orderNumber}`} className="flex h-8 w-8 items-center justify-center text-muted hover:bg-paper hover:text-ink"><ArrowRight size={16} /></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-line lg:hidden">
                {orders.map((order) => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`} className="block p-4 transition-colors hover:bg-[#fcfbf9] sm:px-6">
                    <div className="flex items-start justify-between gap-4"><div><p className="font-medium text-ink">{order.orderNumber}</p><p className="mt-1 text-xs text-muted">{order.user.firstName} {order.user.lastName} · {formatDate(order.createdAt)}</p></div><p className="text-sm font-medium text-ink">{formatPrice(order.total)}</p></div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><StatusPill status={order.status} /><StatusPill status={order.paymentStatus} payment /></div><span className="text-xs text-muted">{order.items.reduce((sum, item) => sum + item.quantity, 0)} pieces <ArrowRight size={13} className="ml-1 inline" /></span></div>
                  </Link>
                ))}
              </div>
              <footer className="flex flex-col gap-3 border-t border-line px-4 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p>Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, data?.pagination.total || 0)} of {data?.pagination.total || 0} orders</p>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={14} /> Previous</Button>
                  <span className="px-2">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next <ChevronRight size={14} /></Button>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

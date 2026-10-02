'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, CalendarDays, CircleDollarSign, ClipboardList, RefreshCw, ShoppingBag, Users } from 'lucide-react';
import { Button } from '@/components/ui';
import { apiClient, type AdminAnalytics, type AdminOrderStatus, type AdminPaymentStatus } from '@/lib/api-client';
import { formatPrice } from '@/lib/utils';

type PeriodDays = 7 | 30 | 90;

const orderStatuses: AdminOrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const paymentStatuses: AdminPaymentStatus[] = ['PAID', 'PENDING', 'FAILED', 'REFUNDED'];

const statusLabels: Record<AdminOrderStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const statusColors: Record<AdminOrderStatus, string> = {
  PENDING: '#aa8750',
  PROCESSING: '#667c9b',
  SHIPPED: '#748875',
  DELIVERED: '#476d50',
  CANCELLED: '#a76758',
};

const paymentLabels: Record<AdminPaymentStatus, string> = {
  PAID: 'Paid',
  PENDING: 'Pending',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

const paymentColors: Record<AdminPaymentStatus, string> = {
  PAID: '#657b62',
  PENDING: '#b3955e',
  FAILED: '#a76758',
  REFUNDED: '#817394',
};

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? null : 100;
  return ((current - previous) / previous) * 100;
}

function ChangeNote({ current, previous, inverse = false }: { current: number; previous: number; inverse?: boolean }) {
  const change = percentChange(current, previous);
  if (change === null) return <span className="text-xs text-muted">No previous-period activity</span>;
  const positive = inverse ? change <= 0 : change >= 0;
  const Icon = change >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs ${positive ? 'text-olive' : 'text-clay'}`}>
      <Icon size={14} /> {Math.abs(change).toFixed(1)}% <span className="ml-1 text-muted">vs previous period</span>
    </span>
  );
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

function SalesChart({ analytics }: { analytics: AdminAnalytics }) {
  const chartData = useMemo(() => {
    const start = new Date(analytics.period.start);
    const byDate = new Map(analytics.salesByDay.map((item) => [item.date.slice(0, 10), item]));
    return Array.from({ length: analytics.period.days }, (_, index) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + index);
      const key = date.toISOString().slice(0, 10);
      const existing = byDate.get(key);
      return { date: key, revenue: existing?.revenue || 0, orders: existing?.orders || 0 };
    });
  }, [analytics]);

  const maxRevenue = Math.max(...chartData.map((item) => item.revenue), 1);
  const plot = chartData.map((item, index) => ({
    ...item,
    x: chartData.length === 1 ? 400 : 32 + (index / (chartData.length - 1)) * 736,
    y: 214 - (item.revenue / maxRevenue) * 184,
  }));
  const line = plot.map((point) => `${point.x},${point.y}`).join(' ');
  const area = `32,214 ${line} 768,214`;
  const labelIndexes = Array.from(new Set([0, Math.floor((plot.length - 1) / 2), plot.length - 1]));

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white">
      <header className="flex flex-col justify-between gap-2 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:px-7">
        <div><p className="text-[10px] uppercase tracking-[0.16em] text-brown">Performance</p><h2 className="mt-1 text-lg font-medium text-ink">Paid revenue</h2></div>
        <p className="text-xs text-muted">Daily verified sales · {analytics.period.days} days</p>
      </header>
      <div className="px-3 pb-4 pt-6 sm:px-7">
        <div className="mb-4 flex items-end justify-between gap-4">
          <p className="text-2xl font-light text-ink sm:text-3xl">{formatPrice(analytics.metrics.revenue)}</p>
          <ChangeNote current={analytics.metrics.revenue} previous={analytics.metrics.previousRevenue} />
        </div>
        <div className="w-full overflow-hidden">
          <svg viewBox="0 0 800 260" role="img" aria-labelledby="sales-chart-title sales-chart-description" className="h-56 w-full overflow-visible sm:h-64">
            <title id="sales-chart-title">Daily paid revenue</title>
            <desc id="sales-chart-description">A line chart showing verified daily revenue for the selected period.</desc>
            {[30, 91, 152, 214].map((y) => <line key={y} x1="32" x2="768" y1={y} y2={y} stroke="#ebe8e1" strokeDasharray="3 5" />)}
            <polygon points={area} fill="url(#salesFill)" />
            <defs><linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#79533f" stopOpacity="0.18" /><stop offset="100%" stopColor="#79533f" stopOpacity="0.01" /></linearGradient></defs>
            <polyline points={line} fill="none" stroke="#79533f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {plot.filter((_, index) => index % Math.max(1, Math.floor(plot.length / 12)) === 0 || index === plot.length - 1).map((point) => (
              <circle key={point.date} cx={point.x} cy={point.y} r="3.5" fill="#fff" stroke="#79533f" strokeWidth="2"><title>{formatShortDate(point.date)}: {formatPrice(point.revenue)} from {point.orders} paid orders</title></circle>
            ))}
            {labelIndexes.map((index) => <text key={plot[index].date} x={plot[index].x} y="244" textAnchor={index === 0 ? 'start' : index === plot.length - 1 ? 'end' : 'middle'} fill="#858078" fontSize="11">{formatShortDate(plot[index].date)}</text>)}
          </svg>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ title, value, caption, icon: Icon, current, previous, inverse = false }: {
  title: string;
  value: string;
  caption: string;
  icon: typeof ShoppingBag;
  current: number;
  previous: number;
  inverse?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[0.12em] text-muted">{title}</span>
        <Icon size={18} strokeWidth={1.6} className="shrink-0 text-brown" />
      </div>
      <p className="mt-5 truncate text-2xl font-light tracking-tight text-ink sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted">{caption}</p>
      <div className="mt-4 border-t border-line pt-3"><ChangeNote current={current} previous={previous} inverse={inverse} /></div>
    </article>
  );
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState<PeriodDays>(30);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      void apiClient.getAdminAnalytics(days).then((response) => {
        if (cancelled) return;
        if (response.success && response.data) {
          setAnalytics(response.data);
          setError(null);
        } else {
          setError(response.error || 'Unable to load analytics.');
        }
        setIsLoading(false);
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [days, reloadKey]);

  return (
    <main className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-line pb-7 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted"><span>Performance</span><span className="text-line">/</span><span className="text-brown">Analytics</span></div>
            <h1 className="text-3xl font-light tracking-[-0.04em] text-ink sm:text-4xl">Business overview</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Read the health of the collection through orders, verified sales, and customer activity.</p>
          </div>
          <div className="flex w-fit items-center gap-1 rounded-xl border border-line bg-white p-1" aria-label="Analytics time period">
            {([7, 30, 90] as const).map((period) => <button key={period} type="button" aria-pressed={days === period} onClick={() => { setIsLoading(true); setDays(period); }} className={`rounded-lg px-3 py-2 text-xs transition-colors ${days === period ? 'bg-brown text-white' : 'text-muted hover:bg-paper hover:text-ink'}`}>{period} days</button>)}
          </div>
        </header>

        {error && <div role="alert" className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-[#e4c9c0] bg-[#fbefeb] p-4 text-sm text-clay sm:flex-row sm:items-center"><p>{error}</p><Button variant="outline" size="sm" onClick={() => { setIsLoading(true); setReloadKey((key) => key + 1); }}><RefreshCw size={14} /> Retry</Button></div>}

        {isLoading && !analytics ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl bg-white" />)}</div>
        ) : analytics ? (
          <>
            <section aria-label="Key performance indicators" className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard title="Paid revenue" value={formatPrice(analytics.metrics.revenue)} caption={`${analytics.metrics.paidOrders} verified paid orders`} icon={CircleDollarSign} current={analytics.metrics.revenue} previous={analytics.metrics.previousRevenue} />
              <MetricCard title="Orders received" value={String(analytics.metrics.totalOrders)} caption={`${analytics.metrics.previousTotalOrders} in the previous period`} icon={ShoppingBag} current={analytics.metrics.totalOrders} previous={analytics.metrics.previousTotalOrders} />
              <MetricCard title="Average order value" value={formatPrice(analytics.metrics.averageOrderValue)} caption="Paid revenue per verified order" icon={ClipboardList} current={analytics.metrics.averageOrderValue} previous={analytics.metrics.previousPaidOrders ? analytics.metrics.previousRevenue / analytics.metrics.previousPaidOrders : 0} />
              <MetricCard title="New customers" value={String(analytics.metrics.newCustomers)} caption="Customer accounts created" icon={Users} current={analytics.metrics.newCustomers} previous={analytics.metrics.previousNewCustomers} />
            </section>

            <section className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.8fr)]">
              <SalesChart analytics={analytics} />
              <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
                <header className="mb-5"><p className="text-[10px] uppercase tracking-[0.16em] text-brown">Fulfilment</p><h2 className="mt-1 text-lg font-medium text-ink">Orders by status</h2></header>
                <div className="space-y-4">
                  {orderStatuses.map((status) => {
                    const count = analytics.ordersByStatus[status] || 0;
                    const percentage = analytics.metrics.totalOrders ? (count / analytics.metrics.totalOrders) * 100 : 0;
                    return <div key={status}><div className="mb-1.5 flex justify-between text-xs"><span className="text-muted">{statusLabels[status]}</span><span className="font-medium text-ink">{count}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#f0eee9]"><div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${percentage}%`, backgroundColor: statusColors[status] }} /></div></div>;
                  })}
                </div>
                <Link href="/admin/orders" className="mt-6 inline-flex items-center gap-2 border-t border-line pt-4 text-xs font-medium uppercase tracking-[0.1em] text-brown hover:text-ink">Open order desk <ArrowRight size={14} /></Link>
              </section>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <section className="overflow-hidden rounded-2xl border border-line bg-white">
                <header className="border-b border-line px-5 py-5 sm:px-6"><p className="text-[10px] uppercase tracking-[0.16em] text-brown">Merchandising</p><h2 className="mt-1 text-lg font-medium text-ink">Top products</h2><p className="mt-1 text-xs text-muted">Ranked by units in paid orders</p></header>
                {analytics.topProducts.length === 0 ? <p className="px-6 py-14 text-center text-sm text-muted">No paid product sales in this period yet.</p> : <div className="divide-y divide-line">{analytics.topProducts.map((product, index) => <div key={product.id} className="flex items-center gap-4 px-5 py-4 sm:px-6"><span className="w-5 text-xs text-muted">0{index + 1}</span><div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-[#f0eee9]">{product.image && <Image src={product.image} alt="" fill sizes="44px" className="object-cover" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{product.name}</p><p className="mt-1 text-xs capitalize text-muted">{product.category}</p></div><div className="text-right"><p className="text-sm font-medium text-ink">{product.unitsSold}</p><p className="text-[10px] text-muted">units</p></div></div>)}</div>}
                <div className="border-t border-line px-5 py-4 sm:px-6"><Link href="/admin/products" className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-brown hover:text-ink">Manage products <ArrowRight size={14} /></Link></div>
              </section>

              <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
                <header className="mb-5"><p className="text-[10px] uppercase tracking-[0.16em] text-brown">Transactions</p><h2 className="mt-1 text-lg font-medium text-ink">Payment outcomes</h2><p className="mt-1 text-xs text-muted">Payment status is reported from recorded orders</p></header>
                <div className="mb-6 flex h-3 overflow-hidden rounded-full bg-[#f0eee9]" aria-label="Payment status distribution">
                  {paymentStatuses.map((status) => {
                    const count = analytics.paymentsByStatus[status]?.count || 0;
                    const total = paymentStatuses.reduce((sum, key) => sum + (analytics.paymentsByStatus[key]?.count || 0), 0);
                    return <span key={status} title={`${paymentLabels[status]}: ${count}`} style={{ width: total ? `${(count / total) * 100}%` : '0%', backgroundColor: paymentColors[status] }} />;
                  })}
                </div>
                <div className="space-y-3">
                  {paymentStatuses.map((status) => {
                    const value = analytics.paymentsByStatus[status];
                    return <div key={status} className="flex items-center justify-between gap-4"><div className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: paymentColors[status] }} /><span className="text-sm text-muted">{paymentLabels[status]}</span></div><div className="text-right"><span className="text-sm font-medium text-ink">{value?.count || 0}</span><span className="ml-3 text-xs text-muted">{formatPrice(value?.amount || 0)}</span></div></div>;
                  })}
                </div>
                <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#f8f7f4] p-4"><CalendarDays size={16} className="mt-0.5 shrink-0 text-brown" /><p className="text-xs leading-5 text-muted">Revenue includes verified paid orders only. Pending, failed, or refunded transactions are not counted as sales.</p></div>
              </section>
            </section>
          </>
        ) : !error ? (
          <div className="rounded-2xl border border-line bg-white px-6 py-16 text-center"><BarChart3 size={28} className="mx-auto text-muted" /><p className="mt-4 text-sm text-muted">Analytics are not available yet.</p></div>
        ) : null}
      </div>
    </main>
  );
}

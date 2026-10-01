'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Search, UserRound, Users, UserRoundCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import { apiClient, type AdminCustomer, type AdminCustomersResponse } from '@/lib/api-client';
import { formatPrice } from '@/lib/utils';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [data, setData] = useState<AdminCustomersResponse | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      void apiClient.getAdminCustomers({ search, page, limit: 15 }).then((response) => {
        if (cancelled) return;
        if (response.success && response.data) {
          setCustomers(response.data.customers);
          setData(response.data);
          setError(null);
        } else {
          setError(response.error || 'Unable to load customers.');
        }
        setIsLoading(false);
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [page, reloadKey, search]);

  const summary = data?.summary;
  const totalPages = data?.pagination.totalPages || 1;
  const rangeStart = data?.pagination.total ? (page - 1) * 15 + 1 : 0;
  const rangeEnd = Math.min(page * 15, data?.pagination.total || 0);

  return (
    <main className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-line pb-7 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted"><span>Operations</span><span className="text-line">/</span><span className="text-brown">Customers</span></div>
            <h1 className="text-3xl font-light tracking-[-0.04em] text-ink sm:text-4xl">Customer book</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">A considered view of the people behind every order.</p>
          </div>
          <span className="flex items-center gap-2 text-xs text-muted"><span className="h-2 w-2 rounded-full bg-olive" /> Account directory</span>
        </header>

        <section aria-label="Customer overview" className="mb-8 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-line bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-[0.1em] text-muted">Customer accounts</span><Users size={18} className="text-brown" /></div>
            <p className="mt-5 text-3xl font-light text-ink">{summary?.allCustomers ?? '—'}</p>
            <p className="mt-2 text-xs text-muted">Registered customer accounts</p>
          </article>
          <article className="rounded-2xl border border-line bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-[0.1em] text-muted">Joined in 30 days</span><UserRound size={18} className="text-brown" /></div>
            <p className="mt-5 text-3xl font-light text-ink">{summary?.recentCustomers ?? '—'}</p>
            <p className="mt-2 text-xs text-muted">New accounts in the last 30 days</p>
          </article>
          <article className="rounded-2xl border border-line bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-[0.1em] text-muted">Customers who ordered</span><UserRoundCheck size={18} className="text-olive" /></div>
            <p className="mt-5 text-3xl font-light text-ink">{summary?.customersWithOrders ?? '—'}</p>
            <p className="mt-2 text-xs text-muted">Accounts with at least one order</p>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex flex-col gap-4 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div><h2 className="text-base font-medium text-ink">All customers</h2><p className="mt-1 text-xs text-muted">Search by name or email address</p></div>
            <label className="relative block w-full sm:max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input aria-label="Search customers" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Name or email" className="w-full rounded-xl border border-line bg-[#fcfbf9] py-2.5 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-olive focus:ring-1 focus:ring-olive" />
            </label>
          </div>
          {error && <div role="alert" className="m-5 rounded-xl border border-[#e4c9c0] bg-[#fbefeb] p-4 text-sm text-clay">{error}<button type="button" onClick={() => { setIsLoading(true); setReloadKey((current) => current + 1); }} className="ml-2 underline underline-offset-4">Retry</button></div>}
          {isLoading ? (
            <div className="space-y-3 p-5" aria-label="Loading customers">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-[#f5f4f1]" />)}</div>
          ) : !error && customers.length === 0 ? (
            <div className="px-6 py-20 text-center"><UserRound size={30} className="mx-auto text-muted" strokeWidth={1.4} /><h3 className="mt-4 text-lg font-medium text-ink">No customers found</h3><p className="mt-2 text-sm text-muted">Try another name or email address.</p></div>
          ) : !error && (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-[#faf9f6] text-[10px] uppercase tracking-[0.12em] text-muted"><tr><th className="px-6 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Joined</th><th className="px-4 py-3 font-medium">Orders</th><th className="px-4 py-3 font-medium">Reviews</th><th className="px-4 py-3 font-medium">Contact</th><th className="px-5 py-3" /></tr></thead>
                  <tbody>{customers.map((customer) => (
                    <tr key={customer.id} className="border-t border-line transition-colors hover:bg-[#fcfbf9]">
                      <td className="px-6 py-4"><Link href={`/admin/users/${customer.id}`} className="font-medium text-ink hover:text-brown">{customer.firstName} {customer.lastName}</Link><p className="mt-1 text-xs text-muted">{customer.email}</p></td>
                      <td className="px-4 py-4 text-sm text-muted">{formatDate(customer.createdAt)}</td>
                      <td className="px-4 py-4 text-sm text-ink">{customer._count.orders}</td>
                      <td className="px-4 py-4 text-sm text-ink">{customer._count.reviews}</td>
                      <td className="px-4 py-4 text-sm text-muted">{customer.phone || '—'}</td>
                      <td className="px-5 py-4"><Link href={`/admin/users/${customer.id}`} aria-label={`View ${customer.firstName} ${customer.lastName}`} className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-paper hover:text-ink"><ArrowRight size={16} /></Link></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <div className="divide-y divide-line md:hidden">
                {customers.map((customer) => (
                  <Link key={customer.id} href={`/admin/users/${customer.id}`} className="block p-4 transition-colors hover:bg-[#fcfbf9]">
                    <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-ink">{customer.firstName} {customer.lastName}</p><p className="mt-1 break-all text-xs text-muted">{customer.email}</p></div><ArrowRight size={16} className="mt-1 shrink-0 text-muted" /></div>
                    <p className="mt-3 text-xs text-muted">{customer._count.orders} orders <span className="mx-1.5 text-line">·</span> Joined {formatDate(customer.createdAt)}</p>
                  </Link>
                ))}
              </div>
              <footer className="flex flex-col gap-3 border-t border-line px-4 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p>Showing {rangeStart}–{rangeEnd} of {data?.pagination.total || 0} customers</p>
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

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Check, CircleAlert, Clock3, CreditCard, MapPin, PackageCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui';
import { apiClient, type AdminOrder, type AdminOrderStatus, type AdminPaymentStatus } from '@/lib/api-client';
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

const fulfilmentSteps: AdminOrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

function StatusPill({ status, payment = false }: { status: AdminOrderStatus | AdminPaymentStatus; payment?: boolean }) {
  const color = payment ? paymentStyle[status as AdminPaymentStatus] : statusStyle[status as AdminOrderStatus];
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${color}`}>{label}</span>;
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function nextAction(status: AdminOrderStatus): { status: AdminOrderStatus; label: string } | null {
  switch (status) {
    case 'PENDING': return { status: 'PROCESSING', label: 'Begin fulfilment' };
    case 'PROCESSING': return { status: 'SHIPPED', label: 'Mark as shipped' };
    case 'SHIPPED': return { status: 'DELIVERED', label: 'Mark delivered' };
    default: return null;
  }
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void apiClient.getAdminOrder(params.id).then((response) => {
      if (cancelled) return;
      if (response.success && response.data) setOrder(response.data);
      else setError(response.error || 'Unable to load this order.');
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [params.id]);

  const changeStatus = async (status: AdminOrderStatus) => {
    if (!order) return;
    if (status === 'CANCELLED' && !window.confirm('Cancel this order? This cannot be undone.')) return;
    setIsUpdating(true);
    setError(null);
    const response = await apiClient.updateAdminOrderStatus(order.id, status);
    if (response.success && response.data) setOrder(response.data);
    else setError(response.error || 'Unable to update fulfilment status.');
    setIsUpdating(false);
  };

  if (isLoading) {
    return <main className="min-h-screen bg-[#f8f7f4] p-8"><div className="mx-auto max-w-6xl animate-pulse space-y-5"><div className="h-8 w-56 bg-[#e9e7e1]" /><div className="h-40 bg-white" /><div className="h-72 bg-white" /></div></main>;
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] px-4 py-16">
        <div className="mx-auto max-w-lg border border-line bg-white p-8 text-center">
          <CircleAlert size={26} className="mx-auto text-clay" />
          <h1 className="mt-4 text-xl font-medium text-ink">Order unavailable</h1>
          <p className="mt-2 text-sm text-muted">{error || 'This order may have been removed.'}</p>
          <Link href="/admin/orders" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brown"><ArrowLeft size={15} /> Back to orders</Link>
        </div>
      </main>
    );
  }

  const action = nextAction(order.status);
  const canFulfil = order.paymentStatus === 'PAID';
  const canCancel = order.paymentStatus !== 'PAID' && (order.status === 'PENDING' || order.status === 'PROCESSING');
  const currentStep = fulfilmentSteps.indexOf(order.status);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <Link href="/admin/orders" className="mb-7 inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-brown"><ArrowLeft size={15} /> Order desk</Link>

        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-line pb-7 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2"><StatusPill status={order.status} /><StatusPill status={order.paymentStatus} payment /></div>
            <h1 className="text-3xl font-light tracking-[-0.04em] text-ink sm:text-4xl">{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-muted">Placed {dateTime(order.createdAt)} <span className="mx-2 text-line">·</span> {itemCount} {itemCount === 1 ? 'piece' : 'pieces'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canCancel && <Button variant="outline" disabled={isUpdating} onClick={() => void changeStatus('CANCELLED')}>Cancel order</Button>}
            {action && <Button disabled={isUpdating || !canFulfil} isLoading={isUpdating} onClick={() => void changeStatus(action.status)}><PackageCheck size={16} />{action.label}</Button>}
          </div>
        </header>

        {error && <div role="alert" className="mb-6 border border-[#e4c9c0] bg-[#fbefeb] p-4 text-sm text-clay">{error}</div>}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(19rem,0.8fr)]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-line bg-white p-5 sm:p-7">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div><p className="text-[10px] uppercase tracking-[0.16em] text-brown">Fulfilment journey</p><h2 className="mt-2 text-xl font-medium text-ink">Order progress</h2></div>
                {order.status === 'CANCELLED' && <StatusPill status="CANCELLED" />}
              </div>
              {order.status === 'CANCELLED' ? (
                <p className="border-l-2 border-clay bg-[#fbf7f5] px-4 py-3 text-sm leading-6 text-muted">This order has been cancelled. Its payment status remains {order.paymentStatus.toLowerCase()} and has not been changed by fulfilment actions.</p>
              ) : (
                <ol className="grid grid-cols-4">
                  {fulfilmentSteps.map((step, index) => {
                    const complete = currentStep >= index;
                    const active = currentStep === index;
                    const StepIcon = index === 0 ? Clock3 : index === 2 ? Truck : index === 3 ? Check : PackageCheck;
                    return (
                      <li key={step} className="relative text-center">
                        {index < fulfilmentSteps.length - 1 && <span className={`absolute left-1/2 top-4 h-px w-full ${currentStep > index ? 'bg-olive' : 'bg-line'}`} />}
                        <span className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-full border ${complete ? 'border-olive bg-olive text-white' : 'border-line bg-white text-muted'} ${active ? 'ring-4 ring-[#edf1ec]' : ''}`}><StepIcon size={14} /></span>
                        <p className={`mt-3 text-[10px] uppercase tracking-[0.09em] sm:text-xs ${active ? 'font-medium text-ink' : complete ? 'text-olive' : 'text-muted'}`}>{step.charAt(0) + step.slice(1).toLowerCase()}</p>
                      </li>
                    );
                  })}
                </ol>
              )}
              {!canFulfil && order.status !== 'CANCELLED' && <p className="mt-7 flex items-start gap-2 border-t border-line pt-5 text-xs leading-5 text-[#876a2e]"><CircleAlert size={15} className="mt-0.5 shrink-0" />Fulfilment actions are locked until payment is verified.</p>}
              {canFulfil && action && <p className="mt-7 border-t border-line pt-5 text-xs text-muted">Payment verified. Continue the order through the next fulfilment step when ready.</p>}
            </section>

            <section className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-7">
                <div><p className="text-[10px] uppercase tracking-[0.16em] text-brown">Items</p><h2 className="mt-1 text-lg font-medium text-ink">In this order</h2></div>
                <span className="text-xs text-muted">{itemCount} total</span>
              </div>
              <div className="divide-y divide-line px-5 sm:px-7">
                {order.items.map((item) => (
                  <article key={item.id} className="flex gap-4 py-5">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#f0eee9] sm:h-24 sm:w-[4.5rem]"><Image src={item.image} alt={item.name} fill sizes="72px" className="object-cover" /></div>
                    <div className="flex min-w-0 flex-1 justify-between gap-3">
                      <div><h3 className="text-sm font-medium text-ink">{item.name}</h3><p className="mt-1 text-xs text-muted">{[item.size, item.color].filter(Boolean).join(' · ') || 'Standard'} · Qty {item.quantity}</p><p className="mt-3 text-xs text-muted">{formatPrice(item.price)} each</p></div>
                      <p className="whitespace-nowrap text-sm font-medium text-ink">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="border-t border-line bg-[#fcfbf9] px-5 py-5 sm:px-7">
                <dl className="ml-auto max-w-sm space-y-2.5 text-sm">
                  <div className="flex justify-between text-muted"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
                  <div className="flex justify-between text-muted"><dt>Shipping</dt><dd>{formatPrice(order.shipping)}</dd></div>
                  <div className="flex justify-between text-muted"><dt>Tax</dt><dd>{formatPrice(order.tax)}</dd></div>
                  <div className="flex justify-between border-t border-line pt-3 font-medium text-ink"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
                </dl>
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2"><CreditCard size={16} className="text-brown" /><h2 className="text-sm font-medium text-ink">Payment</h2></div>
              <div className="mt-5 flex items-center justify-between gap-3"><span className="text-xs text-muted">Payment status</span><StatusPill status={order.paymentStatus} payment /></div>
              <dl className="mt-4 space-y-3 border-t border-line pt-4 text-xs">
                <div className="flex justify-between gap-4"><dt className="text-muted">Method</dt><dd className="text-right capitalize text-ink">{order.paymentMethod}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted">Reference</dt><dd className="max-w-44 break-all text-right text-ink">{order.paymentRef || 'Not recorded'}</dd></div>
              </dl>
              <p className="mt-4 border-t border-line pt-4 text-[11px] leading-5 text-muted">Payment state is verified by the payment provider and cannot be changed from this workspace.</p>
            </section>

            <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2"><MapPin size={16} className="text-brown" /><h2 className="text-sm font-medium text-ink">Delivery</h2></div>
              <address className="mt-4 not-italic text-sm leading-6 text-ink">
                <p className="font-medium">{order.address.firstName} {order.address.lastName}</p>
                <p className="mt-1 text-muted">{order.address.address}</p>
                <p className="text-muted">{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                <p className="text-muted">{order.address.country}</p>
                <p className="mt-2 text-muted">{order.address.phone}</p>
              </address>
            </section>

            <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-medium text-ink">Customer</h2><span className="text-[10px] uppercase tracking-[0.12em] text-muted">Account</span></div>
              <p className="mt-4 text-sm font-medium text-ink">{order.user.firstName} {order.user.lastName}</p>
              <a href={`mailto:${order.user.email}`} className="mt-1 block break-all text-xs text-brown underline-offset-4 hover:underline">{order.user.email}</a>
              {order.user.phone && <p className="mt-2 text-xs text-muted">{order.user.phone}</p>}
              {order.notes && <div className="mt-4 border-t border-line pt-4"><p className="text-[10px] uppercase tracking-[0.12em] text-muted">Order note</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{order.notes}</p></div>}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

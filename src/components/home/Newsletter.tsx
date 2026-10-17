import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function Newsletter() {
  return (
    <section className="border-t border-line bg-[#eeede7] py-14 md:py-18">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-brown">WearCraft / Collection</p>
          <h2 className="max-w-xl text-3xl font-light tracking-[-0.03em] text-ink md:text-4xl">
            A little more considered.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Explore pieces selected for everyday wear and a more thoughtful wardrobe.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium text-ink transition-colors hover:text-brown md:self-auto"
        >
          Browse the collection <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
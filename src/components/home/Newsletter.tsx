'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showToast('Newsletter signup is not available yet. Please check back soon.', 'warning');
  };

  return (
    <section className="bg-[#80533f] py-16 text-white md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white">The journal</p>
          <h2 className="mb-4 text-3xl font-light text-white md:text-4xl">A little more considered.</h2>
          <p className="mb-8 text-white">
            Subscribe to get updates on new arrivals, exclusive offers, and style inspiration.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              maxLength={254}
              required
              className="min-h-12 flex-1 rounded-md border-0 bg-white px-4 py-3 text-ink outline-none focus:ring-2 focus:ring-white"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="bg-[#20211f] text-white hover:bg-[#3f4a3d]"
            >
              Subscribe
            </Button>
          </form>

          <p className="mt-4 text-xs text-white">
            Newsletter signup is not connected yet, and your address will not be stored. Read our{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-white/80">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
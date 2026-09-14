'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      showToast('Successfully subscribed to newsletter!', 'success');
      setEmail('');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section className="bg-brown py-16 text-white md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/70">The journal</p>
          <h2 className="mb-4 text-3xl font-light md:text-4xl">A little more considered.</h2>
          <p className="mb-8 text-white/75">
            Subscribe to get updates on new arrivals, exclusive offers, and style inspiration.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 rounded-sm border-0 bg-white px-4 py-3 text-ink outline-none focus:ring-2 focus:ring-white"
              disabled={isLoading}
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="bg-ink text-white hover:bg-olive-dark"
            >
              Subscribe
            </Button>
          </form>

          <p className="mt-4 text-xs text-white/60">
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </p>
        </div>
      </div>
    </section>
  );
};
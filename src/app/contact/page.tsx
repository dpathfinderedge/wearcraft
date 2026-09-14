'use client';

import { FormEvent, useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Button, Input, useToast } from '@/components/ui';

export default function ContactPage() {
  const { showToast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSending(true);
    window.setTimeout(() => {
      setIsSending(false);
      form.reset();
      showToast('Thanks for reaching out. We will be in touch soon.', 'success');
    }, 700);
  };

  return (
    <main className="min-h-screen bg-paper">
      <section className="border-b border-line bg-[#eeede7]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-brown">Get in touch</p>
          <h1 className="max-w-2xl text-4xl font-light tracking-tight text-ink md:text-6xl">
            We are here to help you find your next favourite piece.
          </h1>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[0.7fr_1.3fr] md:py-20 lg:px-8">
        <div>
          <h2 className="text-2xl font-light text-ink">Contact WearCraft</h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            Questions about an order, sizing, or a future collection? Send us a note and our team will reply within one business day.
          </p>
          <div className="mt-8 space-y-5 text-sm text-muted">
            <a href="mailto:hello@wearcraft.com" className="flex items-center gap-3 transition-colors hover:text-ink">
              <Mail size={18} className="text-brown" />
              hello@wearcraft.com
            </a>
            <a href="tel:+1234567890" className="flex items-center gap-3 transition-colors hover:text-ink">
              <Phone size={18} className="text-brown" />
              +1 (234) 567-890
            </a>
            <span className="flex items-center gap-3">
              <MapPin size={18} className="text-brown" />
              Lagos, Nigeria
            </span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="rounded-sm border border-line bg-white p-6 md:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Name" name="name" required autoComplete="name" />
            <Input label="Email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="mt-5">
            <Input label="Subject" name="subject" required />
          </div>
          <div className="mt-5">
            <label htmlFor="message" className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              className="w-full resize-y border border-line bg-white px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-gray-400 focus:border-olive focus:ring-1 focus:ring-olive"
            />
          </div>
          <Button type="submit" size="lg" isLoading={isSending} className="mt-6 w-full sm:w-auto">
            Send message
          </Button>
        </form>
      </section>
    </main>
  );
}

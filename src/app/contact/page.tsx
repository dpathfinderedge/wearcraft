'use client';

import { FormEvent, useState } from 'react';
import { Mail, MapPin } from 'lucide-react';
import { Button, Input } from '@/components/ui';

export default function ContactPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contactEmail) {
      setSubmissionMessage('The contact form is not connected yet. Please check back soon.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const subject = String(formData.get('subject') || 'WearCraft enquiry');
    const message = [
      `Name: ${String(formData.get('name') || '')}`,
      `Email: ${String(formData.get('email') || '')}`,
      '',
      String(formData.get('message') || ''),
    ].join('\n');
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-paper">
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
            Questions about an order, sizing, or a future collection? {contactEmail
              ? 'Use the form to prepare an email for our team.'
              : 'Our contact details are being prepared.'}
          </p>
          <div className="mt-8 space-y-5 text-sm text-muted">
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 transition-colors hover:text-ink">
                <Mail size={18} className="text-brown" aria-hidden="true" />
                {contactEmail}
              </a>
            )}
            <span className="flex items-center gap-3">
              <MapPin size={18} className="text-brown" aria-hidden="true" />
              Lagos, Nigeria
            </span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="rounded-sm border border-line bg-white p-6 md:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
                Name<span className="ml-1 text-clay" aria-hidden="true">*</span>
              </label>
              <Input id="contact-name" name="name" required autoComplete="name" maxLength={100} />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
                Email<span className="ml-1 text-clay" aria-hidden="true">*</span>
              </label>
              <Input id="contact-email" name="email" type="email" required autoComplete="email" maxLength={254} />
            </div>
          </div>
          <div className="mt-5">
            <label htmlFor="contact-subject" className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              Subject<span className="ml-1 text-clay" aria-hidden="true">*</span>
            </label>
            <Input id="contact-subject" name="subject" required maxLength={150} />
          </div>
          <div className="mt-5">
            <label htmlFor="message" className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              Message<span className="ml-1 text-clay" aria-hidden="true">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              maxLength={4000}
              rows={6}
              className="w-full resize-y border border-line bg-white px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-gray-400 focus:border-olive focus:ring-1 focus:ring-olive"
            />
          </div>
          {submissionMessage && (
            <p role="status" className="mt-4 text-sm text-clay">
              {submissionMessage}
            </p>
          )}
          <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
            Send message
          </Button>
          {!contactEmail && (
            <p className="mt-3 text-xs leading-5 text-muted">
              The form cannot send messages until a support email address is configured.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}

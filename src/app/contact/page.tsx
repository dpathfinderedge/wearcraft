import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';

export default function ContactPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

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
            Questions about an order, sizing, or a future collection? Our support contact details will appear here as soon as they are configured.
          </p>
          <div className="mt-8 space-y-5 text-sm text-muted">
            <span className="flex items-center gap-3">
              <MapPin size={18} className="text-brown" />
              Lagos, Nigeria
            </span>
          </div>
        </div>
        <div className="rounded-sm border border-line bg-white p-6 md:p-8">
          <h2 className="text-2xl font-light text-ink">Customer care</h2>
          {contactEmail ? (
            <>
              <p className="mt-3 text-sm leading-6 text-muted">
                For questions about an order, sizing, or a future collection, email our team.
              </p>
              <a
                href={`mailto:${contactEmail}`}
                className="mt-6 inline-flex min-h-11 items-center gap-3 text-sm font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:text-brown"
              >
                <Mail size={18} aria-hidden="true" />
                {contactEmail}
              </a>
            </>
          ) : (
            <>
              <p role="status" className="mt-3 text-sm leading-6 text-muted">
                Our support contact details are being prepared. Please check back soon.
              </p>
            </>
          )}
          <Link
            href="/#faq"
            className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:text-brown"
          >
            Read our FAQs
          </Link>
        </div>
      </section>
    </div>
  );
}

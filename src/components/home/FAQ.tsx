'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'How long does delivery take?',
    answer: 'Orders are usually delivered within 3 to 5 business days. You will receive tracking details as soon as your order leaves our studio.',
  },
  {
    question: 'Can I return an item?',
    answer: 'Yes. We accept returns within 30 days of delivery, provided the item is unworn, in its original condition, and has its tags attached.',
  },
  {
    question: 'How do I choose the right size?',
    answer: 'Each product page includes its available sizes and fit information. If you are between sizes, contact us and we will be glad to help.',
  },
  {
    question: 'Where are WearCraft orders shipped from?',
    answer: 'We ship from Lagos, Nigeria. Shipping options and estimated delivery dates are shown during checkout.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-t border-line bg-white py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-brown">Need to know</p>
          <h2 className="max-w-sm text-3xl font-light tracking-tight text-ink md:text-4xl">
            Common questions, simply answered.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            Everything you need to feel confident before placing your order.
          </p>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left text-sm font-medium text-ink"
                >
                  {item.question}
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-brown transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <p className="max-w-2xl pb-5 pr-8 text-sm leading-6 text-muted">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

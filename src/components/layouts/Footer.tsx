import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: 'All Products', href: '/shop' },
      { name: "Men's", href: '/shop?category=mens' },
      { name: "Women's", href: '/shop?category=womens' },
      { name: 'Accessories', href: '/shop?category=accessories' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Returns', href: '/returns' },
      { name: 'Size Guide', href: '/size-guide' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
  };

  return (
    <footer className="mt-20 border-t border-line bg-[#eeede7]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-semibold tracking-[-0.04em] text-ink">
              Wear<span className="text-olive">Craft</span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-6 text-muted">
              Thoughtful wardrobe essentials for everyday life, selected with a slower and more considered eye.
            </p>
            <div className="mt-7 space-y-3">
              <div className="flex items-center text-sm text-muted">
                <Mail size={16} className="mr-3 text-olive" strokeWidth={1.5} />
                <a href="mailto:hello@wearcraft.com" className="transition-colors hover:text-ink">
                  hello@wearcraft.com
                </a>
              </div>
              <div className="flex items-center text-sm text-muted">
                <Phone size={16} className="mr-3 text-olive" strokeWidth={1.5} />
                <a href="tel:+1234567890" className="transition-colors hover:text-ink">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center text-sm text-muted">
                <MapPin size={16} className="mr-3 text-olive" strokeWidth={1.5} />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>


          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-ink">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-ink">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-ink">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>





        <div className="flex flex-col items-center justify-between gap-4 border-t border-line pt-7 md:flex-row">
          <p className="text-sm text-muted">
            © {currentYear} WearCraft. All rights reserved.
          </p>
          <div className="mt-4 flex gap-6 md:mt-0">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
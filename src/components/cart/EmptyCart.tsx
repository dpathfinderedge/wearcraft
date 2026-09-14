import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui';

export const EmptyCart: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-line bg-white px-4 py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#eee8df]">
        <ShoppingBag size={34} className="text-brown" strokeWidth={1.5} />
      </div>

      <h2 className="mb-2 text-3xl font-light tracking-[-0.03em] text-ink">
        Your bag is waiting
      </h2>

      <p className="mb-8 max-w-md text-sm leading-6 text-muted">
        Nothing has been added yet. Explore considered essentials and keep the pieces that feel right.
      </p>

      <Link href="/shop">
        <Button variant="primary" size="lg">
          Start Shopping
        </Button>
      </Link>
    </div>
  );
};
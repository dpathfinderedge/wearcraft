import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui';

export const EmptyCart: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag size={40} className="text-gray-400" strokeWidth={1.5} />
      </div>

      <h2 className="text-2xl font-medium text-gray-900 mb-2">
        Your cart is empty
      </h2>

      <p className="text-gray-600 mb-8 max-w-md">
        Looks like you haven&apos;t added anything to your cart yet. Start shopping to fill it up!
      </p>

      <Link href="/shop">
        <Button variant="primary" size="lg">
          Start Shopping
        </Button>
      </Link>
    </div>
  );
};
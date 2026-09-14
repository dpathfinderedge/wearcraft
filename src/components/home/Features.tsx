import { Truck, ShieldCheck, Package, CreditCard } from 'lucide-react';

const features = [
  { icon: <Truck size={24} strokeWidth={1.5} />, title: 'Free Shipping', description: 'On orders over $100' },
  { icon: <ShieldCheck size={24} strokeWidth={1.5} />, title: 'Secure Payment', description: '100% secure checkout' },
  { icon: <Package size={24} strokeWidth={1.5} />, title: 'Easy Returns', description: '30-day return policy' },
  { icon: <CreditCard size={24} strokeWidth={1.5} />, title: 'Flexible Payment', description: 'Multiple payment options' },
];

export function Features() {
  return (
    <section className="border-t border-line bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 divide-y divide-line md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-4 px-4 py-5 first:pl-0 md:py-2 lg:px-7">
              <div className="text-brown">{feature.icon}</div>
              <div>
                <h3 className="text-sm font-medium text-ink">{feature.title}</h3>
                <p className="mt-1 text-xs text-muted">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

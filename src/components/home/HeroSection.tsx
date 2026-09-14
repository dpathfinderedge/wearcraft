import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui';

export function HeroSection() {
  return (
    <section className="bg-[#e9e4da]">
      <div className="mx-auto grid max-w-7xl items-stretch lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-center px-4 py-16 sm:px-6 md:py-24 lg:px-8 lg:py-28">
          <p className="mb-5 text-xs uppercase tracking-[0.22em] text-brown">The autumn edit</p>
          <h1 className="max-w-xl text-5xl font-light tracking-[-0.04em] text-ink md:text-6xl lg:text-7xl">
            Quiet pieces.
            <br />
            <span className="text-brown">Strong presence.</span>
          </h1>
          <p className="mb-8 mt-6 max-w-lg text-base leading-7 text-muted md:text-lg">
            Carefully considered wardrobe essentials for the everyday. Natural textures, generous silhouettes, and a palette made to live together.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/shop">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">Explore the edit</Button>
            </Link>
            <Link href="/shop?category=womens">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">Shop women&apos;s</Button>
            </Link>
          </div>
        </div>
        <div className="relative min-h-[28rem] overflow-hidden lg:min-h-[38rem]">
          <Image
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=1400&fit=crop"
            alt="Woman wearing a considered neutral outfit"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <p className="absolute bottom-6 left-6 text-xs uppercase tracking-[0.2em] text-white">WearCraft / 01</p>
        </div>
      </div>
    </section>
  );
}

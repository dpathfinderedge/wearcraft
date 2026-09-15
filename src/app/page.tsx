import { CategoryGrid, FAQ, FeaturedProducts, Features, HeroSection, Newsletter } from '@/components/home';
import prisma from '@/lib/prisma';
import type { Product } from '@/types/product';

function toProductCategory(category: string): Product['category'] {
  switch (category) {
    case 'mens':
    case 'womens':
    case 'unisex':
    case 'accessories':
      return category;
    default:
      return 'unisex';
  }
}

export default async function Home() {
  const databaseProducts = await prisma.product.findMany({
    where: { featured: true, inStock: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
  });
  const featuredProducts: Product[] = databaseProducts.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.comparePrice ?? undefined,
    category: toProductCategory(product.category),
    images: product.images,
    sizes: product.sizes,
    colors: product.colors,
    material: product.material ?? undefined,
    care: product.care ?? undefined,
    rating: product.rating,
    reviewCount: product.reviewCount,
    inStock: product.inStock,
    featured: product.featured,
    createdAt: product.createdAt.toISOString(),
  }));

  return (
    <>

      <HeroSection />
      <FeaturedProducts products={featuredProducts} />
      <CategoryGrid />
      <Features />
      <FAQ />
      <Newsletter />

    </>
  )
}

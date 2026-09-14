import { CategoryGrid, FAQ, FeaturedProducts, Features, HeroSection, Newsletter } from '@/components/home'
import { products } from '@/data/products'

export default function Home() {
  const featuredProducts = products.slice(0, 8);
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

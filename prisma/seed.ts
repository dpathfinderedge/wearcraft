import { PrismaClient } from '@prisma/client';
import { products as mockProducts } from '../src/data/products';

const prisma = new PrismaClient();

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function main() {
  console.log('Starting database seed...');

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  console.log('Cleared existing data');

  console.log('Seeding products...');

  for (const product of mockProducts) {
    await prisma.product.create({
      data: {
        name: product.name,
        slug: generateSlug(product.name),
        description: product.description,
        price: product.price,
        comparePrice: product.originalPrice || null,
        category: product.category,
        images: product.images,
        sizes: product.sizes,
        colors: product.colors,
        material: product.material || null,
        care: product.care || null,
        featured: product.featured || false,
        inStock: product.inStock !== false,
        stockCount: Math.floor(Math.random() * 100) + 20,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
      },
    });
  }

  console.log(`Seeded ${mockProducts.length} products`);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
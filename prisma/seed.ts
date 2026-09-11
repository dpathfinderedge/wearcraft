import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { products as mockProducts } from '../src/data/products';

const prisma = new PrismaClient();

// Helper function to generate slug from product name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
    .trim();
}

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  console.log('Cleared existing data');

  // Seed products
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
        stockCount: Math.floor(Math.random() * 100) + 20, // Random stock
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
      },
    });
  }

  console.log(`Seeded ${mockProducts.length} products`);

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12);

  const testUser = await prisma.user.create({
    data: {
      email: 'test@wearcraft.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      phone: '+2348012345678',
    },
  });

  console.log('Created test user (test@wearcraft.com / password123)');

  // Create test address
  await prisma.address.create({
    data: {
      userId: testUser.id,
      firstName: 'Test',
      lastName: 'User',
      address: '123 Test Street',
      city: 'Lagos',
      state: 'Lagos',
      zipCode: '100001',
      country: 'Nigeria',
      phone: '+2348012345678',
      isDefault: true,
    },
  });

  console.log('Created test address');

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
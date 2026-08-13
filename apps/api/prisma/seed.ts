import { PrismaClient, UserRole, UpsellType, DiscountType, PromoType, BadgeType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================================
  // 1. SITE CONFIG
  // ============================================================
  await prisma.siteConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      theme: 'light',
      cartIcon: 'pizza_bag',
      addAnimation: 'fly_to_bag',
      freeDeliveryThreshold: 60.00,
      minOrderValue: 40.00,
      enableConfigurator: true,
      enableSounds: true,
      enableConfetti: true,
      socialProofEnabled: true,
      socialProofInterval: 30,
    },
  });
  console.log('✅ Site config seeded');

  // ============================================================
  // 2. CATEGORIES
  // ============================================================
  const categories = await prisma.$transaction([
    prisma.category.upsert({
      where: { slug: 'pizze' },
      update: {},
      create: { name: 'Pizze', slug: 'pizze', sortOrder: 1, isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'makaron' },
      update: {},
      create: { name: 'Makarony', slug: 'makaron', sortOrder: 2, isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'zupy' },
      update: {},
      create: { name: 'Zupy', slug: 'zupy', sortOrder: 3, isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'napoje' },
      update: {},
      create: { name: 'Napoje', slug: 'napoje', sortOrder: 4, isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'dodatki' },
      update: {},
      create: { name: 'Dodatki', slug: 'dodatki', sortOrder: 5, isActive: true },
    }),
  ]);
  console.log('✅ Categories seeded');

  const [pizzeCat, makaronCat, zupyCat, napojeCat, dodatkiCat] = categories;

  // ============================================================
  // 3. PRODUCTS — PIZZE
  // ============================================================
  const margherita = await prisma.product.upsert({
    where: { id: 'prod-margherita' },
    update: {},
    create: {
      id: 'prod-margherita',
      name: 'Margherita',
      description: 'Sos pomidorowy, ser mozzarella, świeża bazylia',
      basePrice: 29.00,
      isAvailable: true,
      isFeatured: true,
      categoryId: pizzeCat.id,
      tags: ['wegetariańska', 'klasyk'],
      allergens: ['gluten', 'laktoza'],
    },
  });

  const capriciosa = await prisma.product.upsert({
    where: { id: 'prod-capriciosa' },
    update: {},
    create: {
      id: 'prod-capriciosa',
      name: 'Capriciosa',
      description: 'Sos pomidorowy, ser, szynka, pieczarki',
      basePrice: 35.00,
      isAvailable: true,
      isFeatured: true,
      categoryId: pizzeCat.id,
      tags: ['bestseller'],
      allergens: ['gluten', 'laktoza'],
    },
  });

  const quattro = await prisma.product.upsert({
    where: { id: 'prod-quattro' },
    update: {},
    create: {
      id: 'prod-quattro',
      name: 'Quattro Formaggi',
      description: 'Cztery sery: mozzarella, gorgonzola, parmezan, ricotta',
      basePrice: 38.00,
      isAvailable: true,
      isFeatured: true,
      categoryId: pizzeCat.id,
      tags: ['wegetariańska', 'serowa'],
      allergens: ['gluten', 'laktoza'],
    },
  });

  const diavola = await prisma.product.upsert({
    where: { id: 'prod-diavola' },
    update: {},
    create: {
      id: 'prod-diavola',
      name: 'Diavola',
      description: 'Sos pomidorowy, ser, salami piccante, papryczki chili',
      basePrice: 36.00,
      isAvailable: true,
      isFeatured: false,
      categoryId: pizzeCat.id,
      tags: ['ostra', 'pikantna'],
      allergens: ['gluten', 'laktoza'],
    },
  });

  const hawajska = await prisma.product.upsert({
    where: { id: 'prod-hawajska' },
    update: {},
    create: {
      id: 'prod-hawajska',
      name: 'Hawajska',
      description: 'Sos pomidorowy, ser, szynka, ananas',
      basePrice: 34.00,
      isAvailable: true,
      isFeatured: false,
      categoryId: pizzeCat.id,
      tags: ['słodka'],
      allergens: ['gluten', 'laktoza'],
    },
  });

  console.log('✅ Pizza products seeded');

  // ============================================================
  // 4. VARIANTS (pizza sizes)
  // ============================================================
  await prisma.$transaction([
    // Margherita variants
    prisma.variant.create({ data: { productId: margherita.id, name: 'Mała 30cm', priceAdjustment: 0, isActive: true } }),
    prisma.variant.create({ data: { productId: margherita.id, name: 'Średnia 40cm', priceAdjustment: 10, isActive: true } }),
    prisma.variant.create({ data: { productId: margherita.id, name: 'Duża 50cm', priceAdjustment: 18, isActive: true } }),
    // Capriciosa variants
    prisma.variant.create({ data: { productId: capriciosa.id, name: 'Mała 30cm', priceAdjustment: 0, isActive: true } }),
    prisma.variant.create({ data: { productId: capriciosa.id, name: 'Średnia 40cm', priceAdjustment: 10, isActive: true } }),
    prisma.variant.create({ data: { productId: capriciosa.id, name: 'Duża 50cm', priceAdjustment: 18, isActive: true } }),
    // Quattro variants
    prisma.variant.create({ data: { productId: quattro.id, name: 'Mała 30cm', priceAdjustment: 0, isActive: true } }),
    prisma.variant.create({ data: { productId: quattro.id, name: 'Średnia 40cm', priceAdjustment: 12, isActive: true } }),
    prisma.variant.create({ data: { productId: quattro.id, name: 'Duża 50cm', priceAdjustment: 20, isActive: true } }),
    // Diavola variants
    prisma.variant.create({ data: { productId: diavola.id, name: 'Mała 30cm', priceAdjustment: 0, isActive: true } }),
    prisma.variant.create({ data: { productId: diavola.id, name: 'Średnia 40cm', priceAdjustment: 11, isActive: true } }),
    prisma.variant.create({ data: { productId: diavola.id, name: 'Duża 50cm', priceAdjustment: 19, isActive: true } }),
    // Hawajska variants
    prisma.variant.create({ data: { productId: hawajska.id, name: 'Mała 30cm', priceAdjustment: 0, isActive: true } }),
    prisma.variant.create({ data: { productId: hawajska.id, name: 'Średnia 40cm', priceAdjustment: 10, isActive: true } }),
    prisma.variant.create({ data: { productId: hawajska.id, name: 'Duża 50cm', priceAdjustment: 18, isActive: true } }),
  ]);
  console.log('✅ Variants seeded');

  // ============================================================
  // 5. ADDONS
  // ============================================================
  await prisma.$transaction([
    prisma.productAddon.create({ data: { productId: margherita.id, name: 'Extra ser', price: 5.00, maxQuantity: 2, isActive: true } }),
    prisma.productAddon.create({ data: { productId: margherita.id, name: 'Pieczarki', price: 3.00, maxQuantity: 1, isActive: true } }),
    prisma.productAddon.create({ data: { productId: margherita.id, name: 'Szynka', price: 4.00, maxQuantity: 1, isActive: true } }),
    prisma.productAddon.create({ data: { productId: capriciosa.id, name: 'Extra ser', price: 5.00, maxQuantity: 2, isActive: true } }),
    prisma.productAddon.create({ data: { productId: capriciosa.id, name: 'Oliwki', price: 3.00, maxQuantity: 1, isActive: true } }),
    prisma.productAddon.create({ data: { productId: quattro.id, name: 'Extra ser', price: 5.00, maxQuantity: 2, isActive: true } }),
    prisma.productAddon.create({ data: { productId: quattro.id, name: 'Rukola', price: 2.50, maxQuantity: 1, isActive: true } }),
    prisma.productAddon.create({ data: { productId: diavola.id, name: 'Extra chili', price: 1.00, maxQuantity: 3, isActive: true } }),
    prisma.productAddon.create({ data: { productId: diavola.id, name: 'Cebula', price: 1.50, maxQuantity: 1, isActive: true } }),
  ]);
  console.log('✅ Addons seeded');

  // ============================================================
  // 6. PRODUCTS — MAKARONY
  // ============================================================
  await prisma.product.upsert({
    where: { id: 'prod-bolognese' },
    update: {},
    create: {
      id: 'prod-bolognese',
      name: 'Spaghetti Bolognese',
      description: 'Makaron spaghetti z sosem mięsnym na bazie wołowiny',
      basePrice: 28.00,
      isAvailable: true,
      isFeatured: false,
      categoryId: makaronCat.id,
      tags: ['mięsne'],
      allergens: ['gluten', 'laktoza'],
    },
  });

  await prisma.product.upsert({
    where: { id: 'prod-arrabbiata' },
    update: {},
    create: {
      id: 'prod-arrabbiata',
      name: 'Penne Arrabbiata',
      description: 'Makaron penne z pikantnym sosem pomidorowym i czosnkiem',
      basePrice: 26.00,
      isAvailable: true,
      isFeatured: false,
      categoryId: makaronCat.id,
      tags: ['wegetariańska', 'ostra'],
      allergens: ['gluten'],
    },
  });

  console.log('✅ Pasta products seeded');

  // ============================================================
  // 7. PRODUCTS — ZUPY
  // ============================================================
  await prisma.product.upsert({
    where: { id: 'prod-pomidorowa' },
    update: {},
    create: {
      id: 'prod-pomidorowa',
      name: 'Zupa pomidorowa',
      description: 'Kremowa zupa pomidorowa z grzankami',
      basePrice: 14.00,
      isAvailable: true,
      isFeatured: false,
      categoryId: zupyCat.id,
      tags: ['wegetariańska'],
      allergens: ['gluten', 'laktoza'],
    },
  });

  await prisma.product.upsert({
    where: { id: 'prod-rosol' },
    update: {},
    create: {
      id: 'prod-rosol',
      name: 'Rosół z domowym makaronem',
      description: 'Tradycyjny rosół z kurczaka z domowym makaronem i warzywami',
      basePrice: 15.00,
      isAvailable: true,
      isFeatured: false,
      categoryId: zupyCat.id,
      tags: ['klasyk'],
      allergens: ['gluten'],
    },
  });

  console.log('✅ Soup products seeded');

  // ============================================================
  // 8. PRODUCTS — NAPOJE
  // ============================================================
  const cola = await prisma.product.upsert({
    where: { id: 'prod-cola-1l' },
    update: {},
    create: {
      id: 'prod-cola-1l',
      name: 'Coca-Cola 1L',
      description: 'Butelka 1 litr',
      basePrice: 5.00,
      isAvailable: true,
      isFeatured: false,
      categoryId: napojeCat.id,
      tags: ['napój'],
      allergens: [],
    },
  });

  await prisma.product.upsert({
    where: { id: 'prod-sprite-05' },
    update: {},
    create: {
      id: 'prod-sprite-05',
      name: 'Sprite 0.5L',
      description: 'Butelka 0.5 litra',
      basePrice: 3.50,
      isAvailable: true,
      isFeatured: false,
      categoryId: napojeCat.id,
      tags: ['napój'],
      allergens: [],
    },
  });

  await prisma.product.upsert({
    where: { id: 'prod-woda' },
    update: {},
    create: {
      id: 'prod-woda',
      name: 'Woda niegazowana 0.5L',
      description: 'Butelka 0.5 litra',
      basePrice: 2.50,
      isAvailable: true,
      isFeatured: false,
      categoryId: napojeCat.id,
      tags: ['napój'],
      allergens: [],
    },
  });

  console.log('✅ Drink products seeded');

  // ============================================================
  // 9. PRODUCTS — DODATKI
  // ============================================================
  const sosCzosnkowy = await prisma.product.upsert({
    where: { id: 'prod-sos-czosnkowy' },
    update: {},
    create: {
      id: 'prod-sos-czosnkowy',
      name: 'Sos czosnkowy',
      description: 'Domowy sos czosnkowy, 100ml',
      basePrice: 3.00,
      isAvailable: true,
      isFeatured: false,
      categoryId: dodatkiCat.id,
      tags: ['dodatek'],
      allergens: ['laktoza'],
    },
  });

  await prisma.product.upsert({
    where: { id: 'prod-sos-pomidorowy' },
    update: {},
    create: {
      id: 'prod-sos-pomidorowy',
      name: 'Sos pomidorowy',
      description: 'Domowy sos pomidorowy, 100ml',
      basePrice: 3.00,
      isAvailable: true,
      isFeatured: false,
      categoryId: dodatkiCat.id,
      tags: ['dodatek'],
      allergens: [],
    },
  });

  await prisma.product.upsert({
    where: { id: 'prod-tiramisu' },
    update: {},
    create: {
      id: 'prod-tiramisu',
      name: 'Tiramisu',
      description: 'Klasyczne włoskie tiramisu',
      basePrice: 12.00,
      isAvailable: true,
      isFeatured: false,
      categoryId: dodatkiCat.id,
      tags: ['deser'],
      allergens: ['gluten', 'laktoza', 'jajka'],
    },
  });

  console.log('✅ Addon products seeded');

  // ============================================================
  // 10. BADGES
  // ============================================================
  await prisma.$transaction([
    prisma.productBadge.create({ data: { productId: margherita.id, badgeType: BadgeType.bestseller, isActive: true } }),
    prisma.productBadge.create({ data: { productId: capriciosa.id, badgeType: BadgeType.bestseller, isActive: true } }),
    prisma.productBadge.create({ data: { productId: capriciosa.id, badgeType: BadgeType.chef_choice, isActive: true } }),
    prisma.productBadge.create({ data: { productId: quattro.id, badgeType: BadgeType.chef_choice, isActive: true } }),
    prisma.productBadge.create({ data: { productId: diavola.id, badgeType: BadgeType.new, isActive: true } }),
  ]);
  console.log('✅ Badges seeded');

  // ============================================================
  // 11. ADMIN USER
  // ============================================================
  const bcrypt = require('bcrypt');
  const adminPassword = await bcrypt.hash('Admin123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@ros.pl' },
    update: {},
    create: {
      email: 'admin@ros.pl',
      phone: '+48123456789',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'ROS',
      role: UserRole.admin,
    },
  });
  console.log('✅ Admin user seeded');

  console.log('\n🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

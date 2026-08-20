import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with Pizzeria Nova Okay menu...');

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
      create: { name: 'Pizze', slug: 'pizze', sortOrder: 1, isActive: true, imageUrl: '/images/cat-pizza.jpg' },
    }),
    prisma.category.upsert({
      where: { slug: 'makaron' },
      update: {},
      create: { name: 'Makarony', slug: 'makaron', sortOrder: 2, isActive: true, imageUrl: '/images/cat-pasta.jpg' },
    }),
    prisma.category.upsert({
      where: { slug: 'salatki' },
      update: {},
      create: { name: 'Sałatki', slug: 'salatki', sortOrder: 3, isActive: true, imageUrl: '/images/cat-salad.jpg' },
    }),
    prisma.category.upsert({
      where: { slug: 'napoje' },
      update: {},
      create: { name: 'Napoje', slug: 'napoje', sortOrder: 4, isActive: true, imageUrl: '/images/cat-drinks.jpg' },
    }),
  ]);
  console.log('✅ Categories seeded');

  const [pizzeCat, makaronCat, salatkiCat, napojeCat] = categories;

  // ============================================================
  // 3. PIZZE — wszystkie z menu Pizzeria Nova Okay
  // ============================================================
  const pizzaData = [
    { id: 'pizza-margherita', name: 'Margherita', desc: 'Sos pomidorowy, ser', price: 31.00, tags: ['wegetariańska', 'klasyk'], featured: false },
    { id: 'pizza-fungi', name: 'Fungi', desc: 'Sos pomidorowy, ser, pieczarki', price: 36.00, tags: ['wegetariańska'], featured: false },
    { id: 'pizza-vesuvio', name: 'Vesuvio', desc: 'Sos pomidorowy, ser, szynka', price: 36.00, tags: ['klasyk'], featured: false },
    { id: 'pizza-capriciosa', name: 'Capriciosa', desc: 'Sos pomidorowy, ser, szynka, pieczarki', price: 39.00, tags: ['bestseller'], featured: true },
    { id: 'pizza-con-ananas', name: 'Con Ananas', desc: 'Sos pomidorowy, ser, szynka, ananas', price: 38.00, tags: ['słodko-słone'], featured: false },
    { id: 'pizza-broccoli', name: 'Broccoli', desc: 'Sos pomidorowy, ser, brokuły, salami, jajko', price: 40.00, tags: [], featured: false },
    { id: 'pizza-ragazzo', name: 'Ragazzo', desc: 'Sos pomidorowy, ser, jajko, boczek, cebula', price: 40.00, tags: [], featured: false },
    { id: 'pizza-cacciato', name: 'Cacciato', desc: 'Sos pomidorowy, ser, salami, cebula', price: 40.00, tags: [], featured: false },
    { id: 'pizza-pepperoni', name: 'Pepperoni', desc: 'Sos pomidorowy, ser, salami, papryka, cebula', price: 41.00, tags: [], featured: false },
    { id: 'pizza-carina', name: 'Carina', desc: 'Sos pomidorowy, ser, szynka, pieczarki, kukurydza, kurczak', price: 41.00, tags: [], featured: false },
    { id: 'pizza-chicken', name: 'Chicken', desc: 'Sos pomidorowy, ser, kurczak, kukurydza, papryka, cebula', price: 41.00, tags: [], featured: false },
    { id: 'pizza-santa-bomba', name: 'Santa Bomba', desc: 'Sos śmietanowy, grzyby leśne, szynka dojrzewająca', price: 44.00, tags: ['na białym sosie'], featured: false },
    { id: 'pizza-diavola', name: 'Diavola', desc: 'Sos pomidorowy, ser, mascarpone, szynka, papryka jalapeno', price: 44.00, tags: ['ostra'], featured: true },
    { id: 'pizza-verdura', name: 'Verdura', desc: 'Sos pomidorowy, ser, pieczarki, cebula, oliwki, papryka konserwowa, kukurydza, brokuły, szparagi', price: 44.00, tags: ['wegetariańska'], featured: false },
    { id: 'pizza-mafia', name: 'Mafia', desc: 'Sos pomidorowy, ser, boczek, cebula, papryka jalapeno', price: 44.00, tags: ['ostra'], featured: false },
    { id: 'pizza-quatro-formaggio', name: 'Quatro Formaggio', desc: 'Sos pomidorowy, ser żółty, mozzarella, ser pleśniowy, ser feta, rukola', price: 44.00, tags: ['wegetariańska', '4 sery'], featured: false },
    { id: 'pizza-melanzana', name: 'Melanzana', desc: 'Sos bolognese, bakłażan, mozzarella', price: 44.00, tags: [], featured: false },
    { id: 'pizza-caruso', name: 'Caruso', desc: 'Sos pomidorowy, ser, krewetki duże 6 szt., szynka, pieczarki', price: 46.00, tags: ['owoce morza'], featured: false },
    { id: 'pizza-tomaso', name: 'Tomaso', desc: 'Sos pomidorowy, ser, szynka, krewetki duże 6 szt.', price: 47.00, tags: ['owoce morza'], featured: false },
    { id: 'pizza-pescadora', name: 'Pescadora', desc: 'Sos pomidorowy, ser, tuńczyk, krewetki duże 6 szt.', price: 47.00, tags: ['owoce morza'], featured: false },
    { id: 'pizza-prosciutto', name: 'Prosciutto', desc: 'Sos pomidorowy, ser, mozzarella, pomidory koktajlowe, szynka dojrzewająca, rukola, ser parmezan, pesto bazyliowe', price: 48.00, tags: ['premium'], featured: true },
    { id: 'pizza-karamba', name: 'Karamba', desc: 'Sos pomidorowy, ser, polędwica wołowa, pieczarki, cebula, czosnek', price: 48.00, tags: [], featured: false },
    { id: 'pizza-frutti-di-mare', name: 'Frutti di mare', desc: 'Sos pomidorowy, ser, owoce morza, czosnek, cebula, natka pietruszki', price: 51.00, tags: ['owoce morza', 'premium'], featured: false },
    { id: 'pizza-nova-okay', name: 'Nova Okay', desc: 'Sos pomidorowy, podwójny ser, szynka, pieczarki, cebula, papryka, salami, bekon', price: 50.00, tags: ['bestseller', 'premium'], featured: true },
    { id: 'pizza-familijna', name: 'Familijna 40 cm', desc: 'Sos pomidorowy, ser + 4 dowolne składniki (w cenie)', price: 69.00, tags: ['rodzinna'], featured: true },
  ];

  const pizzas: any[] = [];
  for (const p of pizzaData) {
    const product = await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        description: p.desc,
        basePrice: p.price,
        isAvailable: true,
        isFeatured: p.featured,
        categoryId: pizzeCat.id,
        tags: p.tags,
        allergens: ['gluten', 'laktoza'],
      },
    });
    pizzas.push(product);
  }
  console.log(`✅ ${pizzas.length} pizzas seeded`);

  // ============================================================
  // 4. PIZZA VARIANTS (rozmiary)
  // ============================================================
  const variantData = [
    { name: '32 cm', adjustment: 0 },
    { name: '40 cm', adjustment: 15 },
    { name: '50 cm', adjustment: 25 },
  ];

  for (const pizza of pizzas) {
    for (const v of variantData) {
      await prisma.variant.upsert({
        where: { id: `${pizza.id}-variant-${v.name.replace(/\s/g, '-').toLowerCase()}` },
        update: {},
        create: {
          id: `${pizza.id}-variant-${v.name.replace(/\s/g, '-').toLowerCase()}`,
          productId: pizza.id,
          name: v.name,
          priceAdjustment: v.adjustment,
          isActive: true,
        },
      });
    }
  }
  console.log('✅ Pizza variants seeded');

  // ============================================================
  // 5. PIZZA ADDONS (dodatki do pizzy)
  // ============================================================
  const addonData = [
    { name: 'Podwójny ser', price: 5.00 },
    { name: 'Pieczarki', price: 4.00 },
    { name: 'Szynka', price: 5.00 },
    { name: 'Salami', price: 5.00 },
    { name: 'Boczek', price: 5.00 },
    { name: 'Kurczak', price: 5.00 },
    { name: 'Krewetki', price: 8.00 },
    { name: 'Ananas', price: 4.00 },
    { name: 'Jalapeno', price: 4.00 },
    { name: 'Rukola', price: 4.00 },
    { name: 'Oliwki', price: 4.00 },
    { name: 'Cebula', price: 3.00 },
    { name: 'Czosnek', price: 3.00 },
    { name: 'Kukurydza', price: 3.00 },
    { name: 'Brokuły', price: 4.00 },
    { name: 'Papryka', price: 3.00 },
    { name: 'Pomidory', price: 3.00 },
    { name: 'Ser feta', price: 5.00 },
    { name: 'Ser pleśniowy', price: 5.00 },
    { name: 'Mozzarella', price: 5.00 },
  ];

  for (const pizza of pizzas) {
    for (const a of addonData) {
      await prisma.productAddon.upsert({
        where: { id: `${pizza.id}-addon-${a.name.replace(/\s/g, '-').toLowerCase()}` },
        update: {},
        create: {
          id: `${pizza.id}-addon-${a.name.replace(/\s/g, '-').toLowerCase()}`,
          productId: pizza.id,
          name: a.name,
          price: a.price,
          isActive: true,
          maxQuantity: 3,
        },
      });
    }
  }
  console.log('✅ Pizza addons seeded');

  // ============================================================
  // 6. BADGES
  // ============================================================
  const badgeData = [
    { productId: 'pizza-capriciosa', text: 'Bestseller', color: 'gold' },
    { productId: 'pizza-diavola', text: 'Polecana', color: 'red' },
    { productId: 'pizza-prosciutto', text: 'Premium', color: 'purple' },
    { productId: 'pizza-nova-okay', text: 'Bestseller', color: 'gold' },
    { productId: 'pizza-nova-okay', text: 'Premium', color: 'purple' },
    { productId: 'pizza-familijna', text: 'Rodzinna', color: 'green' },
    { productId: 'pizza-frutti-di-mare', text: 'Premium', color: 'purple' },
  ];

  for (const b of badgeData) {
    const pizza = pizzas.find(p => p.id === b.productId);
    if (pizza) {
      await prisma.productBadge.upsert({
        where: { id: `${b.productId}-badge-${b.text.toLowerCase().replace(/\s/g, '-')}` },
        update: {},
        create: {
          id: `${b.productId}-badge-${b.text.toLowerCase().replace(/\s/g, '-')}`,
          productId: b.productId,
          text: b.text,
          color: b.color,
          isActive: true,
        },
      });
    }
  }
  console.log('✅ Badges seeded');

  // ============================================================
  // 7. MAKARONY
  // ============================================================
  const makaronData = [
    { id: 'makaron-bolognese', name: 'Spaghetti Bolognese', desc: 'Sos pomidorowy z mięsem wołowym, parmezan', price: 32.00, tags: ['klasyk'] },
    { id: 'makaron-carbonara', name: 'Spaghetti Carbonara', desc: 'Boczek, jajko, parmezan, śmietana', price: 32.00, tags: ['klasyk'] },
    { id: 'makaron-arabiata', name: 'Penne Arabiata', desc: 'Sos pomidorowy, czosnek, chili, oliwa', price: 30.00, tags: ['ostry', 'wegetariański'] },
    { id: 'makaron-losos', name: 'Tagliatelle z łososiem', desc: 'Łosoś wędzony, szpinak, sos śmietanowy', price: 38.00, tags: ['premium'] },
    { id: 'makaron-krewetki', name: 'Tagliatelle z krewetkami', desc: 'Krewetki, czosnek, pomidorki koktajlowe, bazylia', price: 40.00, tags: ['owoce morza', 'premium'] },
  ];

  for (const m of makaronData) {
    await prisma.product.upsert({
      where: { id: m.id },
      update: {},
      create: {
        id: m.id,
        name: m.name,
        description: m.desc,
        basePrice: m.price,
        isAvailable: true,
        isFeatured: false,
        categoryId: makaronCat.id,
        tags: m.tags,
        allergens: ['gluten', 'laktoza'],
      },
    });
  }
  console.log(`✅ ${makaronData.length} makarony seeded`);

  // ============================================================
  // 8. SAŁATKI
  // ============================================================
  const salatkaData = [
    { id: 'salatka-grecka', name: 'Sałatka grecka', desc: 'Pomidor, ogórek, cebula, oliwki, feta, oliwa', price: 24.00, tags: ['wegetariańska'] },
    { id: 'salatka-cezar', name: 'Sałatka Cezar', desc: 'Kurczak, sałata, grzanki, parmezan, sos Cezar', price: 26.00, tags: ['klasyk'] },
    { id: 'salatka-tunczyk', name: 'Sałatka z tuńczykiem', desc: 'Tuńczyk, sałata, pomidor, ogórek, cebula, oliwa', price: 26.00, tags: [] },
  ];

  for (const s of salatkaData) {
    await prisma.product.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        name: s.name,
        description: s.desc,
        basePrice: s.price,
        isAvailable: true,
        isFeatured: false,
        categoryId: salatkiCat.id,
        tags: s.tags,
        allergens: [],
      },
    });
  }
  console.log(`✅ ${salatkaData.length} sałatki seeded`);

  // ============================================================
  // 9. NAPOJE
  // ============================================================
  const napojData = [
    { id: 'napoj-cola-05', name: 'Coca-Cola 0,5L', desc: '', price: 8.00, tags: ['gazowany'] },
    { id: 'napoj-cola-1', name: 'Coca-Cola 1L', desc: '', price: 12.00, tags: ['gazowany'] },
    { id: 'napoj-pepsi-05', name: 'Pepsi 0,5L', desc: '', price: 8.00, tags: ['gazowany'] },
    { id: 'napoj-pepsi-1', name: 'Pepsi 1L', desc: '', price: 12.00, tags: ['gazowany'] },
    { id: 'napoj-woda-niegaz', name: 'Woda niegazowana 0,5L', desc: '', price: 5.00, tags: ['woda'] },
    { id: 'napoj-woda-gaz', name: 'Woda gazowana 0,5L', desc: '', price: 5.00, tags: ['woda'] },
    { id: 'napoj-sok-pomarancza', name: 'Sok pomarańczowy', desc: 'Świeżo wyciskany', price: 8.00, tags: ['świeży'] },
    { id: 'napoj-sok-jablko', name: 'Sok jabłkowy', desc: 'Świeżo wyciskany', price: 8.00, tags: ['świeży'] },
    { id: 'napoj-herbata', name: 'Herbata', desc: 'Czarna lub zielona', price: 7.00, tags: ['gorący'] },
    { id: 'napoj-kawa', name: 'Kawa', desc: 'Espresso lub czarna', price: 9.00, tags: ['gorący'] },
  ];

  for (const n of napojData) {
    await prisma.product.upsert({
      where: { id: n.id },
      update: {},
      create: {
        id: n.id,
        name: n.name,
        description: n.desc,
        basePrice: n.price,
        isAvailable: true,
        isFeatured: false,
        categoryId: napojeCat.id,
        tags: n.tags,
        allergens: [],
      },
    });
  }
  console.log(`✅ ${napojData.length} napoje seeded`);

  // ============================================================
  // 10. ADMIN USER
  // ============================================================
  const adminPassword = await bcrypt.hash('Admin123!', 12);

  await prisma.user.upsert({
    where: { phone: '+48123456789' },
    update: {},
    create: {
      email: 'admin@ros.pl',
      phone: '+48123456789',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'ROS',
      role: UserRole.admin,
      isPhoneVerified: true,
    },
  });
  console.log('✅ Admin user seeded (phone: +48123456789, pass: Admin123!)');

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

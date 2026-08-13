import { PrismaClient, UpsellType, DiscountType, PromoType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding upsell configs...');

  // ============================================================
  // 1. UPSELL CONFIGS
  // ============================================================
  await prisma.upsellConfig.upsert({
    where: { id: 'upsell-cross-sell-pizza' },
    update: {},
    create: {
      id: 'upsell-cross-sell-pizza',
      name: 'Cross-sell po pizzy',
      type: UpsellType.cross_sell,
      rules: {
        triggerProductIds: ['prod-margherita', 'prod-capriciosa', 'prod-quattro', 'prod-diavola', 'prod-hawajska'],
        recommendedProductIds: ['prod-cola-1l', 'prod-sos-czosnkowy', 'prod-tiramisu'],
        maxRecommendations: 3,
        displayTiming: 'after_add',
      },
      isActive: true,
      priority: 1,
    },
  });

  await prisma.upsellConfig.upsert({
    where: { id: 'upsell-last-minute' },
    update: {},
    create: {
      id: 'upsell-last-minute',
      name: 'Ostatnia szansa przed zamówieniem',
      type: UpsellType.last_minute,
      rules: {
        recommendedProductIds: ['prod-sos-czosnkowy', 'prod-sos-pomidorowy', 'prod-cola-1l', 'prod-tiramisu'],
        maxRecommendations: 4,
        displayTiming: 'before_checkout',
      },
      isActive: true,
      priority: 2,
    },
  });

  await prisma.upsellConfig.upsert({
    where: { id: 'upsell-threshold-delivery' },
    update: {},
    create: {
      id: 'upsell-threshold-delivery',
      name: 'Darmowa dostawa — próg',
      type: UpsellType.threshold,
      rules: {
        thresholdAmount: 60.00,
        recommendedProductIds: ['prod-cola-1l', 'prod-sos-czosnkowy'],
        maxRecommendations: 2,
        displayTiming: 'after_add',
      },
      isActive: true,
      priority: 3,
    },
  });

  console.log('✅ Upsell configs seeded');

  // ============================================================
  // 2. BUNDLE CONFIGS
  // ============================================================
  await prisma.bundleConfig.upsert({
    where: { id: 'bundle-rodzinny' },
    update: {},
    create: {
      id: 'bundle-rodzinny',
      name: 'Zestaw Rodzinny',
      discountType: DiscountType.percent,
      discountValue: 15,
      slots: [
        { categoryId: 'pizze', quantity: 2, label: 'Wybierz 2 pizze' },
        { categoryId: 'napoje', quantity: 1, label: 'Wybierz napój' },
        { categoryId: 'dodatki', quantity: 1, label: 'Wybierz sos' },
      ],
      isActive: true,
    },
  });

  await prisma.bundleConfig.upsert({
    where: { id: 'bundle-duo' },
    update: {},
    create: {
      id: 'bundle-duo',
      name: 'Zestaw dla Dwojga',
      discountType: DiscountType.fixed,
      discountValue: 10,
      slots: [
        { categoryId: 'pizze', quantity: 2, label: 'Wybierz 2 pizze' },
        { categoryId: 'napoje', quantity: 2, label: 'Wybierz 2 napoje' },
      ],
      isActive: true,
    },
  });

  console.log('✅ Bundle configs seeded');

  // ============================================================
  // 3. PROMO CONFIGS
  // ============================================================
  await prisma.promoConfig.upsert({
    where: { id: 'promo-sos-1zl' },
    update: {},
    create: {
      id: 'promo-sos-1zl',
      name: 'Sos za 1 zł',
      type: PromoType.addon_deal,
      conditions: {
        minOrderValue: 40.00,
        applicableProductIds: ['prod-sos-czosnkowy', 'prod-sos-pomidorowy'],
      },
      reward: {
        type: 'fixed_price',
        value: 1.00,
      },
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
  });

  await prisma.promoConfig.upsert({
    where: { id: 'promo-weekend' },
    update: {},
    create: {
      id: 'promo-weekend',
      name: 'Weekendowa promocja — 2 pizze + napój = 59 zł',
      type: PromoType.discount,
      conditions: {
        minOrderValue: 0,
      },
      reward: {
        type: 'fixed_price',
        value: 59.00,
      },
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
  });

  await prisma.promoConfig.upsert({
    where: { id: 'promo-free-delivery' },
    update: {},
    create: {
      id: 'promo-free-delivery',
      name: 'Darmowa dostawa powyżej 60 zł',
      type: PromoType.free_delivery,
      conditions: {
        minOrderValue: 60.00,
      },
      reward: {
        type: 'fixed_amount',
        value: 8.00,
      },
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
  });

  console.log('✅ Promo configs seeded');

  console.log('\n🎉 Upsell seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Upsell seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

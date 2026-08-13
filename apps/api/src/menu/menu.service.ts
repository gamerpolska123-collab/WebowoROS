import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const MENU_CACHE_KEY = 'menu:full';
const MENU_CACHE_TTL = 300; // 5 minutes

@Injectable()
export class MenuService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getFullMenu() {
    // Try cache first
    const cached = await this.redis.get(MENU_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        products: {
          where: { isAvailable: true },
          include: {
            variants: { where: { isActive: true } },
            addons: { where: { isActive: true } },
            badges: { where: { isActive: true } },
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    // Cache result
    await this.redis.set(MENU_CACHE_KEY, JSON.stringify(categories), MENU_CACHE_TTL);

    return categories;
  }

  async getProductById(id: string) {
    const cacheKey = `product:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: { where: { isActive: true } },
        addons: { where: { isActive: true } },
        badges: { where: { isActive: true } },
      },
    });

    if (product) {
      await this.redis.set(cacheKey, JSON.stringify(product), 600); // 10 minutes
    }

    return product;
  }

  async invalidateMenuCache() {
    await this.redis.del(MENU_CACHE_KEY);
    // Also invalidate all product caches (simplification)
    const keys = await this.redis.getClient().keys('product:*');
    if (keys.length > 0) {
      await this.redis.getClient().del(...keys);
    }
  }
}

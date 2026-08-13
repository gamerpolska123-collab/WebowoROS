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
    // Use SCAN to avoid blocking Redis with KEYS command
    const client = this.redis.getClient();
    let cursor = '0';
    const productKeys: string[] = [];
    do {
      const reply = await client.scan(cursor, 'MATCH', 'product:*', 'COUNT', 100);
      cursor = reply[0];
      productKeys.push(...reply[1]);
    } while (cursor !== '0');

    if (productKeys.length > 0) {
      // Delete in batches of 100 to avoid too many arguments
      for (let i = 0; i < productKeys.length; i += 100) {
        const batch = productKeys.slice(i, i + 100);
        await client.del(...batch);
      }
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: { where: { isActive: true } },
        addons: { where: { isActive: true } },
        badges: { where: { isActive: true } },
        upsellConfigs: {
          where: { upsellConfig: { isActive: true } },
          include: { upsellConfig: true },
        },
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findFeatured() {
    return this.prisma.product.findMany({
      where: { isFeatured: true, isAvailable: true },
      include: {
        variants: { where: { isActive: true } },
        addons: { where: { isActive: true } },
        badges: { where: { isActive: true } },
      },
    });
  }
}

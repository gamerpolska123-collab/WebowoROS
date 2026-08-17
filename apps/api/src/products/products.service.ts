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

  async findByCategory(categoryId: string) {
    return this.prisma.product.findMany({
      where: { categoryId, isAvailable: true, isDeleted: false },
      include: {
        variants: { where: { isActive: true } },
        addons: { where: { isActive: true } },
        badges: { where: { isActive: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        category: true,
        variants: { where: { isActive: true } },
        addons: { where: { isActive: true } },
        badges: { where: { isActive: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}

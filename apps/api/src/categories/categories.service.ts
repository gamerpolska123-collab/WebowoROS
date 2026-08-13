import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
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
        },
      },
    });
  }

  async findOne(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isAvailable: true },
          include: {
            variants: { where: { isActive: true } },
            addons: { where: { isActive: true } },
            badges: { where: { isActive: true } },
          },
        },
      },
    });
  }
}

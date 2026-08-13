import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MenuService } from '../menu/menu.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private menuService: MenuService,
  ) {}

  // ============================================================
  // PRODUCTS CRUD
  // ============================================================
  async createProduct(data: any) {
    const product = await this.prisma.product.create({ data });
    await this.menuService.invalidateMenuCache();
    return product;
  }

  async updateProduct(id: string, data: any) {
    await this.prisma.product.findUniqueOrThrow({ where: { id } });
    const product = await this.prisma.product.update({ where: { id }, data });
    await this.menuService.invalidateMenuCache();
    return product;
  }

  async deleteProduct(id: string) {
    await this.prisma.product.findUniqueOrThrow({ where: { id } });
    await this.prisma.product.update({ where: { id }, data: { isAvailable: false } });
    await this.menuService.invalidateMenuCache();
    return { message: 'Product deactivated' };
  }

  // ============================================================
  // CATEGORIES CRUD
  // ============================================================
  async createCategory(data: any) {
    const category = await this.prisma.category.create({ data });
    await this.menuService.invalidateMenuCache();
    return category;
  }

  async updateCategory(id: string, data: any) {
    const category = await this.prisma.category.update({ where: { id }, data });
    await this.menuService.invalidateMenuCache();
    return category;
  }

  async deleteCategory(id: string) {
    await this.prisma.category.update({ where: { id }, data: { isActive: false } });
    await this.menuService.invalidateMenuCache();
    return { message: 'Category deactivated' };
  }

  // ============================================================
  // UPSELL CONFIGS
  // ============================================================
  async getUpsellConfigs() {
    return this.prisma.upsellConfig.findMany({ orderBy: { priority: 'asc' } });
  }

  async createUpsellConfig(data: any) {
    return this.prisma.upsellConfig.create({ data });
  }

  async updateUpsellConfig(id: string, data: any) {
    return this.prisma.upsellConfig.update({ where: { id }, data });
  }

  // ============================================================
  // BUNDLE CONFIGS
  // ============================================================
  async getBundleConfigs() {
    return this.prisma.bundleConfig.findMany();
  }

  async createBundleConfig(data: any) {
    return this.prisma.bundleConfig.create({ data });
  }

  async updateBundleConfig(id: string, data: any) {
    return this.prisma.bundleConfig.update({ where: { id }, data });
  }

  // ============================================================
  // PROMO CONFIGS
  // ============================================================
  async getPromoConfigs() {
    return this.prisma.promoConfig.findMany();
  }

  async createPromoConfig(data: any) {
    return this.prisma.promoConfig.create({ data });
  }

  async updatePromoConfig(id: string, data: any) {
    return this.prisma.promoConfig.update({ where: { id }, data });
  }

  // ============================================================
  // SITE CONFIG
  // ============================================================
  async getSiteConfig() {
    return this.prisma.siteConfig.findFirst();
  }

  async updateSiteConfig(id: string, data: any) {
    const config = await this.prisma.siteConfig.update({ where: { id }, data });
    await this.menuService.invalidateMenuCache();
    return config;
  }

  // ============================================================
  // DASHBOARD STATS
  // ============================================================
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      todayRevenue,
      activeProducts,
      totalCustomers,
    ] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: today }, status: { not: 'cancelled' } },
        _sum: { finalAmount: true },
      }),
      this.prisma.product.count({ where: { isAvailable: true } }),
      this.prisma.user.count({ where: { role: 'customer' } }),
    ]);

    return {
      todayOrders,
      todayRevenue: Number(todayRevenue._sum.finalAmount || 0),
      activeProducts,
      totalCustomers,
    };
  }


  // ============================================================
  // ORDERS (admin + kitchen + driver)
  // ============================================================
  async getOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { select: { name: true, imageUrl: true } },
            addons: true,
          },
        },
        user: { select: { firstName: true, lastName: true, phone: true } },
        history: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  async updateOrderStatus(id: string, status: string, note?: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: status as any,
        history: {
          create: {
            status: status as any,
            note: note || `Status changed to ${status}`,
          },
        },
      },
      include: {
        items: { include: { product: true } },
        history: { orderBy: { createdAt: 'desc' } },
      },
    });
    return order;
  }

  // ============================================================
  // STATS
  // ============================================================
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      pendingOrders,
      preparingOrders,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.aggregate({ _sum: { finalAmount: true } }),
      this.prisma.order.aggregate({ where: { createdAt: { gte: today } }, _sum: { finalAmount: true } }),
      this.prisma.order.count({ where: { status: { in: ['pending_payment', 'paid', 'confirmed'] } } }),
      this.prisma.order.count({ where: { status: 'preparing' } }),
    ]);

    return {
      totalOrders,
      todayOrders,
      totalRevenue: Number(totalRevenue._sum.finalAmount || 0),
      todayRevenue: Number(todayRevenue._sum.finalAmount || 0),
      pendingOrders,
      preparingOrders,
    };
  }
}

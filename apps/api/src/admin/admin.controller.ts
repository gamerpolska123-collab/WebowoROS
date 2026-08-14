import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UpdateOrderStatusSchema } from '../orders/order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Dashboard
  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // Products
  @Get('products')
  async getProducts() {
    return this.adminService.getProducts();
  }

  @Post('products')
  async createProduct(@Body() data: any) {
    return this.adminService.createProduct(data);
  }

  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateProduct(id, data);
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  // Categories
  @Get('categories')
  async getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  async createCategory(@Body() data: any) {
    return this.adminService.createCategory(data);
  }

  @Patch('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // Upsell
  @Get('upsell')
  async getUpsellConfigs() {
    return this.adminService.getUpsellConfigs();
  }

  @Post('upsell')
  async createUpsellConfig(@Body() data: any) {
    return this.adminService.createUpsellConfig(data);
  }

  @Patch('upsell/:id')
  async updateUpsellConfig(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateUpsellConfig(id, data);
  }

  // Bundles
  @Get('bundles')
  async getBundleConfigs() {
    return this.adminService.getBundleConfigs();
  }

  @Post('bundles')
  async createBundleConfig(@Body() data: any) {
    return this.adminService.createBundleConfig(data);
  }

  @Patch('bundles/:id')
  async updateBundleConfig(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateBundleConfig(id, data);
  }

  // Promos
  @Get('promos')
  async getPromoConfigs() {
    return this.adminService.getPromoConfigs();
  }

  @Post('promos')
  async createPromoConfig(@Body() data: any) {
    return this.adminService.createPromoConfig(data);
  }

  @Patch('promos/:id')
  async updatePromoConfig(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updatePromoConfig(id, data);
  }

  // Site Config
  @Get('config')
  async getSiteConfig() {
    return this.adminService.getSiteConfig();
  }

  @Patch('config/:id')
  async updateSiteConfig(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateSiteConfig(id, data);
  }

  // Orders (admin + kitchen + driver)
  @Get('orders')
  @Roles(UserRole.admin, UserRole.kitchen, UserRole.driver)
  async getOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('deliveryType') deliveryType?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getOrders({ page, limit, status, deliveryType, dateFrom, dateTo, search });
  }

  @Patch('orders/:id/status')
  @Roles(UserRole.admin, UserRole.kitchen, UserRole.driver)
  @UsePipes(new ZodValidationPipe(UpdateOrderStatusSchema))
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: { status: string; note?: string },
  ) {
    return this.adminService.updateOrderStatus(id, dto.status as any, dto.note);
  }

  // Stats
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }
}

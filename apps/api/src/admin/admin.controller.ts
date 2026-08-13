import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
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
}

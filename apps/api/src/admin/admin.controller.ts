import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UpdateOrderStatusSchema, UpdateOrderStatusDtoClass } from '../orders/order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
@ApiBearerAuth('access-token')
@ApiCookieAuth('cookie-auth')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Dashboard
  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard stats', description: 'Returns overview statistics for admin dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // Products
  @Get('products')
  @ApiOperation({ summary: 'List products', description: 'Returns all products (including soft-deleted)' })
  @ApiResponse({ status: 200, description: 'Products list' })
  async getProducts() {
    return this.adminService.getProducts();
  }

  @Post('products')
  @ApiOperation({ summary: 'Create product', description: 'Creates a new menu product' })
  @ApiResponse({ status: 201, description: 'Product created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createProduct(@Body() data: any) {
    return this.adminService.createProduct(data);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update product', description: 'Updates product details' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateProduct(id, data);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Soft delete product', description: 'Marks product as deleted (isDeleted: true)' })
  @ApiResponse({ status: 200, description: 'Product soft-deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  // Categories
  @Get('categories')
  @ApiOperation({ summary: 'List categories', description: 'Returns all product categories' })
  @ApiResponse({ status: 200, description: 'Categories list' })
  async getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create category', description: 'Creates a new product category' })
  @ApiResponse({ status: 201, description: 'Category created' })
  async createCategory(@Body() data: any) {
    return this.adminService.createCategory(data);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  async updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // Upsell
  @Get('upsell')
  @ApiOperation({ summary: 'List upsell configs' })
  @ApiResponse({ status: 200, description: 'Upsell configurations' })
  async getUpsellConfigs() {
    return this.adminService.getUpsellConfigs();
  }

  @Post('upsell')
  @ApiOperation({ summary: 'Create upsell config' })
  @ApiResponse({ status: 201, description: 'Upsell config created' })
  async createUpsellConfig(@Body() data: any) {
    return this.adminService.createUpsellConfig(data);
  }

  @Patch('upsell/:id')
  @ApiOperation({ summary: 'Update upsell config' })
  @ApiResponse({ status: 200, description: 'Upsell config updated' })
  async updateUpsellConfig(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateUpsellConfig(id, data);
  }

  // Bundles
  @Get('bundles')
  @ApiOperation({ summary: 'List bundle configs' })
  @ApiResponse({ status: 200, description: 'Bundle configurations' })
  async getBundleConfigs() {
    return this.adminService.getBundleConfigs();
  }

  @Post('bundles')
  @ApiOperation({ summary: 'Create bundle config' })
  @ApiResponse({ status: 201, description: 'Bundle config created' })
  async createBundleConfig(@Body() data: any) {
    return this.adminService.createBundleConfig(data);
  }

  @Patch('bundles/:id')
  @ApiOperation({ summary: 'Update bundle config' })
  @ApiResponse({ status: 200, description: 'Bundle config updated' })
  async updateBundleConfig(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateBundleConfig(id, data);
  }

  // Promos
  @Get('promos')
  @ApiOperation({ summary: 'List promo configs' })
  @ApiResponse({ status: 200, description: 'Promo configurations' })
  async getPromoConfigs() {
    return this.adminService.getPromoConfigs();
  }

  @Post('promos')
  @ApiOperation({ summary: 'Create promo config' })
  @ApiResponse({ status: 201, description: 'Promo config created' })
  async createPromoConfig(@Body() data: any) {
    return this.adminService.createPromoConfig(data);
  }

  @Patch('promos/:id')
  @ApiOperation({ summary: 'Update promo config' })
  @ApiResponse({ status: 200, description: 'Promo config updated' })
  async updatePromoConfig(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updatePromoConfig(id, data);
  }

  // Site Config
  @Get('config')
  @ApiOperation({ summary: 'Get site config' })
  @ApiResponse({ status: 200, description: 'Site configuration' })
  async getSiteConfig() {
    return this.adminService.getSiteConfig();
  }

  @Patch('config/:id')
  @ApiOperation({ summary: 'Update site config' })
  @ApiResponse({ status: 200, description: 'Site config updated' })
  async updateSiteConfig(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateSiteConfig(id, data);
  }

  // Orders (admin + kitchen + driver)
  @Get('orders')
  @Roles(UserRole.admin, UserRole.kitchen, UserRole.driver)
  @ApiOperation({ summary: 'List orders (paginated)', description: 'Returns paginated orders with filters. Accessible by admin, kitchen, and driver roles.' })
  @ApiResponse({ status: 200, description: 'Paginated orders list' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, example: 20, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, example: 'preparing', description: 'Filter by order status' })
  @ApiQuery({ name: 'deliveryType', required: false, example: 'delivery', description: 'Filter by delivery type' })
  @ApiQuery({ name: 'dateFrom', required: false, example: '2024-01-01', description: 'Filter from date (ISO)' })
  @ApiQuery({ name: 'dateTo', required: false, example: '2024-12-31', description: 'Filter to date (ISO)' })
  @ApiQuery({ name: 'search', required: false, example: 'John', description: 'Search by customer name or order ID' })
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
  @ApiOperation({ summary: 'Update order status', description: 'Changes order status with validation. Accessible by admin, kitchen, and driver roles.' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
  @UsePipes(new ZodValidationPipe(UpdateOrderStatusSchema))
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDtoClass,
  ) {
    return this.adminService.updateOrderStatus(id, dto.status as any, dto.note);
  }

  // Stats
  @Get('stats')
  @ApiOperation({ summary: 'Get admin stats', description: 'Returns aggregated statistics for admin panel' })
  @ApiResponse({ status: 200, description: 'Admin statistics' })
  async getStats() {
    return this.adminService.getStats();
  }
}

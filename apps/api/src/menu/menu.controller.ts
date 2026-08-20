import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('menu')
@Public()
@Controller('menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: 'Get full menu', description: 'Returns all categories with products (cached 5min)' })
  @ApiResponse({ status: 200, description: 'Menu categories with products' })
  async getMenu() {
    return this.menuService.getFullMenu();
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product by ID', description: 'Returns single product details (cached 10min)' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProduct(@Param('id') id: string) {
    return this.menuService.getProductById(id);
  }
}

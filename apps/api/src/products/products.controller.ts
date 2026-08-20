import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('menu/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('featured')
  async getFeatured() {
    const products = await this.productsService.findFeatured();
    return { products };
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    const product = await this.productsService.findById(id);
    return { product };
  }
}

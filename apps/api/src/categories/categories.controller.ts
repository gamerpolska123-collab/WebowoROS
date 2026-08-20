import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('menu')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getMenu() {
    const categories = await this.categoriesService.findAll();
    return { categories };
  }

  @Get('categories/:slug')
  async getCategory(@Param('slug') slug: string) {
    const category = await this.categoriesService.findOne(slug);
    return { category };
  }
}

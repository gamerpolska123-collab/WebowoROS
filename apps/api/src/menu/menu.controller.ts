import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get()
  async getMenu() {
    return this.menuService.getFullMenu();
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    return this.menuService.getProductById(id);
  }
}

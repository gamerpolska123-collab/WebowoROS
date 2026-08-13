import { Controller, Post, Get, Body, Res, Req, UsePipes, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RegisterDtoSchema, LoginDtoSchema, RefreshTokenDtoSchema } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private prisma: PrismaService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterDtoSchema))
  async register(@Body() dto: unknown, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto as Parameters<AuthService['register']>[0]);
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginDtoSchema))
  async login(@Body() dto: unknown, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto as Parameters<AuthService['login']>[0]);

    // Set HttpOnly cookies
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { user: result.user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: { refreshToken: string }, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.refresh(dto.refreshToken);

    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Token refreshed' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() dto: { refreshToken?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    // In real implementation, get userId from JWT guard
    // For now, just clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logout successful' };
  }


  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    const userId = req.user?.sub;
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true },
    });
  }
}
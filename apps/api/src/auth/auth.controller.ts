import { Controller, Post, Get, Body, Res, Req, UsePipes, UseGuards, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { RequestWithUser } from '../common/types/request-with-user';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  RegisterDtoSchema, LoginDtoSchema, RefreshTokenDtoSchema,
  SendSmsCodeDtoSchema, VerifySmsCodeDtoSchema, SetPasswordDtoSchema,
  PhoneLoginDtoSchema,
  RegisterDtoClass, LoginDtoClass, RefreshTokenDtoClass,
  SendSmsCodeDtoClass, VerifySmsCodeDtoClass, SetPasswordDtoClass,
  PhoneLoginDtoClass,
  CsrfResponseDto, RegisterResponseDto, LoginResponseDto,
  MessageResponseDto, AuthUserResponseDto,
  SmsCodeResponseDto, VerifyCodeResponseDto,
} from './auth.dto';

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}

function generateCsrfToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private prisma: PrismaService) {}

  // ============================================================
  // CSRF
  // ============================================================

  @Public()
  @Get('csrf')
  @ApiOperation({ summary: 'Get CSRF token', description: 'Returns a CSRF token to be used in state-changing requests via X-CSRF-Token header' })
  @ApiResponse({ status: 200, description: 'CSRF token generated', type: CsrfResponseDto })
  async getCsrfToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = generateCsrfToken();
    res.cookie('csrf_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });
    return { csrfToken: token };
  }

  // ============================================================
  // SMS FLOW (customer primary auth)
  // ============================================================

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('sms/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send SMS verification code', description: 'Sends a 4-digit verification code to the provided phone number. In demo mode returns code 5555.' })
  @ApiResponse({ status: 200, description: 'SMS code sent', type: SmsCodeResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid phone number' })
  @UsePipes(new ZodValidationPipe(SendSmsCodeDtoSchema))
  async sendSmsCode(@Body() dto: SendSmsCodeDtoClass) {
    return this.authService.sendSmsCode(dto as Parameters<AuthService['sendSmsCode']>[0]);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('sms/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify SMS code', description: 'Verifies the 4-digit SMS code. Returns whether user already has a password set.' })
  @ApiResponse({ status: 200, description: 'Code verified', type: VerifyCodeResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired code' })
  @UsePipes(new ZodValidationPipe(VerifySmsCodeDtoSchema))
  async verifySmsCode(@Body() dto: VerifySmsCodeDtoClass) {
    return this.authService.verifySmsCode(dto as Parameters<AuthService['verifySmsCode']>[0]);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('sms/set-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set password after SMS verification', description: 'Sets password for a phone-verified user. Upgrades guest to customer and logs in automatically.' })
  @ApiResponse({ status: 200, description: 'Password set and logged in', type: LoginResponseDto })
  @ApiResponse({ status: 400, description: 'Phone not verified or passwords do not match' })
  @UsePipes(new ZodValidationPipe(SetPasswordDtoSchema))
  async setPassword(@Body() dto: SetPasswordDtoClass, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.setPassword(dto as Parameters<AuthService['setPassword']>[0]);

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

    return { user: result.user };
  }

  // ============================================================
  // PHONE LOGIN
  // ============================================================

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('phone-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with phone and password', description: 'Authenticates user by phone number and password' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @UsePipes(new ZodValidationPipe(PhoneLoginDtoSchema))
  async phoneLogin(@Body() dto: PhoneLoginDtoClass, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const ip = getClientIp(req);
    const result = await this.authService.phoneLogin(dto as Parameters<AuthService['phoneLogin']>[0], ip);

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

    const remaining = await this.authService.getRemainingAttempts(ip);
    res.setHeader('X-RateLimit-Remaining', String(remaining));

    return { user: result.user };
  }

  // ============================================================
  // LEGACY EMAIL LOGIN (admin + existing customers)
  // ============================================================

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login (email or phone)', description: 'Authenticates user by email or phone number and password' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Too many failed attempts — account temporarily locked' })
  @UsePipes(new ZodValidationPipe(LoginDtoSchema))
  async login(@Body() dto: LoginDtoClass, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const ip = getClientIp(req);
    const result = await this.authService.login(dto as Parameters<AuthService['login']>[0], ip);

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

    const remaining = await this.authService.getRemainingAttempts(ip);
    res.setHeader('X-RateLimit-Remaining', String(remaining));

    return { user: result.user };
  }

  // ============================================================
  // REGISTRATION (admin/manual)
  // ============================================================

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register new user', description: 'Creates a new customer account (admin/manual use)' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: RegisterResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @UsePipes(new ZodValidationPipe(RegisterDtoSchema))
  async register(@Body() dto: RegisterDtoClass, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto as Parameters<AuthService['register']>[0]);
    return result;
  }

  // ============================================================
  // TOKEN MANAGEMENT
  // ============================================================

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token', description: 'Rotates refresh token and issues new access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed', type: MessageResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshTokenDtoClass, @Res({ passthrough: true }) res: Response) {
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
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout', description: 'Clears all auth cookies' })
  @ApiResponse({ status: 200, description: 'Logout successful', type: MessageResponseDto })
  async logout(
    @Body() dto: { refreshToken?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('csrf_token');

    return { message: 'Logout successful' };
  }

  // ============================================================
  // CURRENT USER
  // ============================================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiCookieAuth('cookie-auth')
  @ApiOperation({ summary: 'Get current user', description: 'Returns authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile', type: AuthUserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@Req() req: RequestWithUser) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }
    return this.authService.getMe(userId);
  }
}

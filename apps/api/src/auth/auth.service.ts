import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import {
  RegisterDto, LoginDto, PhoneLoginDto,
  SendSmsCodeDto, VerifySmsCodeDto, SetPasswordDto,
} from './auth.dto';

interface TokenPayload {
  sub: string;
  email?: string | null;
  phone: string;
  role: UserRole;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_TTL_SECONDS = 15 * 60; // 15 minutes
const SMS_CODE_TTL_SECONDS = 10 * 60; // 10 minutes
const DEMO_SMS_CODE = '5555';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
  ) {}

  // ============================================================
  // REGISTRATION (admin/manual only — customers use SMS flow)
  // ============================================================

  async register(dto: RegisterDto) {
    const whereClause: any[] = [{ phone: dto.phone }];
    if (dto.email) {
      whereClause.push({ email: dto.email });
    }

    const existing = await this.prisma.user.findFirst({
      where: { OR: whereClause },
    });

    if (existing) {
      throw new ConflictException('User with this phone or email already exists');
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 12)
      : null;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email || null,
        phone: dto.phone,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: UserRole.customer,
        isPhoneVerified: true, // admin registration = pre-verified
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isPhoneVerified: true,
        createdAt: true,
      },
    });

    return { user, message: 'Registration successful' };
  }

  // ============================================================
  // SMS FLOW (customer primary auth method)
  // ============================================================

  /**
   * Send SMS verification code to phone number.
   * In production this calls SMS API. For now returns demo code 5555.
   * Creates a guest user record if phone doesn't exist yet.
   */
  async sendSmsCode(dto: SendSmsCodeDto) {
    const { phone } = dto;

    // Normalize phone (remove spaces, keep + and digits)
    const normalizedPhone = phone.replace(/\s/g, '');

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      // Create guest user — will be upgraded to customer after password set
      user = await this.prisma.user.create({
        data: {
          phone: normalizedPhone,
          firstName: 'Gość',
          lastName: '',
          role: UserRole.guest,
          passwordHash: null,
          isPhoneVerified: false,
        },
      });
    }

    // Generate and store SMS code
    // In production: generate random 4-digit code
    const code = DEMO_SMS_CODE;
    const expiresAt = new Date(Date.now() + SMS_CODE_TTL_SECONDS * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        smsCode: code,
        smsCodeExpiresAt: expiresAt,
      },
    });

    // TODO: Integrate with SMS API (e.g. Twilio, SMSAPI.pl, etc.)
    // await this.smsProvider.send(phone, `Twój kod weryfikacyjny WebowoROS: ${code}`);

    return {
      message: 'SMS code sent successfully',
      demoCode: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  /**
   * Verify SMS code. Returns whether user already has a password set.
   */
  async verifySmsCode(dto: VerifySmsCodeDto) {
    const { phone, code } = dto;
    const normalizedPhone = phone.replace(/\s/g, '');

    const user = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      throw new NotFoundException('Phone number not found');
    }

    if (!user.smsCode || !user.smsCodeExpiresAt) {
      throw new BadRequestException('No active verification code. Request a new one.');
    }

    if (new Date() > user.smsCodeExpiresAt) {
      throw new BadRequestException('Verification code expired. Request a new one.');
    }

    if (user.smsCode !== code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Mark phone as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isPhoneVerified: true,
        smsCode: null,
        smsCodeExpiresAt: null,
      },
    });

    return {
      valid: true,
      message: 'Phone verified successfully',
      hasPassword: !!user.passwordHash,
      userId: user.id,
    };
  }

  /**
   * Set password after SMS verification. Upgrades guest to customer.
   */
  async setPassword(dto: SetPasswordDto) {
    const { phone, password } = dto;
    const normalizedPhone = phone.replace(/\s/g, '');

    const user = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isPhoneVerified) {
      throw new BadRequestException('Phone must be verified before setting password');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        role: user.role === UserRole.guest ? UserRole.customer : user.role,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isPhoneVerified: true,
      },
    });

    const tokens = await this.generateTokens(updated.id, updated.email, updated.phone, updated.role);
    await this.storeRefreshToken(updated.id, tokens.refreshToken);

    return {
      user: updated,
      ...tokens,
      message: 'Password set successfully. You are now logged in.',
    };
  }

  // ============================================================
  // LOGIN (legacy email + new phone)
  // ============================================================

  async login(dto: LoginDto, ip: string) {
    // Check brute force protection
    const attempts = await this.getLoginAttempts(ip);
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const ttl = await this.redis.ttl(`login_attempts:${ip}`);
      throw new ForbiddenException(
        `Too many failed login attempts. Try again in ${Math.ceil(ttl / 60)} minutes.`
      );
    }

    let user = null;

    if (dto.email) {
      user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
    } else if (dto.phone) {
      user = await this.prisma.user.findUnique({
        where: { phone: dto.phone.replace(/\s/g, '') },
      });
    }

    if (!user) {
      await this.recordFailedAttempt(ip);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      await this.recordFailedAttempt(ip);
      throw new UnauthorizedException('Password not set. Please verify your phone first.');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      await this.recordFailedAttempt(ip);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account deactivated');
    }

    // Successful login — reset attempts
    await this.resetLoginAttempts(ip);

    const tokens = await this.generateTokens(user.id, user.email, user.phone, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
      },
      ...tokens,
    };
  }

  async phoneLogin(dto: PhoneLoginDto, ip: string) {
    return this.login({ phone: dto.phone, password: dto.password } as LoginDto, ip);
  }

  // ============================================================
  // TOKEN MANAGEMENT
  // ============================================================

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokens = await this.generateTokens(
      stored.user.id,
      stored.user.email,
      stored.user.phone,
      stored.user.role,
    );

    // Rotate refresh token
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    await this.storeRefreshToken(stored.user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return { message: 'Logged out from all devices' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isPhoneVerified: true,
        addresses: true,
        preferences: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // ============================================================
  // BRUTE FORCE PROTECTION
  // ============================================================

  private async getLoginAttempts(ip: string): Promise<number> {
    const count = await this.redis.get(`login_attempts:${ip}`);
    return count ? parseInt(count, 10) : 0;
  }

  async getRemainingAttempts(ip: string): Promise<number> {
    const attempts = await this.getLoginAttempts(ip);
    return Math.max(0, MAX_LOGIN_ATTEMPTS - attempts);
  }

  private async recordFailedAttempt(ip: string): Promise<void> {
    const key = `login_attempts:${ip}`;
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, LOGIN_BLOCK_TTL_SECONDS);
    }
  }

  private async resetLoginAttempts(ip: string): Promise<void> {
    await this.redis.del(`login_attempts:${ip}`);
  }

  // ============================================================
  // TOKEN GENERATION
  // ============================================================

  private async generateTokens(userId: string, email: string | null, phone: string, role: UserRole) {
    const payload: TokenPayload = { sub: userId, email, phone, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  private parseExpiryToDate(raw: string): Date {
    const now = new Date();
    const num = parseInt(raw.replace(/\D/g, ''), 10) || 7;
    const unit = raw.replace(/[0-9]/g, '').trim() || 'd';
    switch (unit) {
      case 'm': now.setMinutes(now.getMinutes() + num); break;
      case 'h': now.setHours(now.getHours() + num); break;
      case 'd': now.setDate(now.getDate() + num); break;
      case 'w': now.setDate(now.getDate() + num * 7); break;
      case 'M': now.setMonth(now.getMonth() + num); break;
      case 'y': now.setFullYear(now.getFullYear() + num); break;
      default: now.setDate(now.getDate() + num); break;
    }
    return now;
  }

  private async storeRefreshToken(userId: string, token: string) {
    const raw = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    const expiresAt = this.parseExpiryToDate(raw);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }
}

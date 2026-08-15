import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { RegisterDto, LoginDto } from './auth.dto';

interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_TTL_SECONDS = 15 * 60; // 15 minutes

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
    });

    if (existing) {
      throw new ConflictException('User with this email or phone already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: UserRole.customer,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    return { user, message: 'Registration successful' };
  }

  async login(dto: LoginDto, ip: string) {
    // Check brute force protection
    const attempts = await this.getLoginAttempts(ip);
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const ttl = await this.redis.ttl(`login_attempts:${ip}`);
      throw new ForbiddenException(
        `Too many failed login attempts. Try again in ${Math.ceil(ttl / 60)} minutes.`
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      await this.recordFailedAttempt(ip);
      throw new UnauthorizedException('Invalid credentials');
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

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate refresh token (security best practice)
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    const tokens = await this.generateTokens(stored.user.id, stored.user.email, stored.user.role);
    await this.storeRefreshToken(stored.user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }
    // Invalidate all user refresh tokens for complete logout
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: 'Logout successful' };
  }

  // Brute force helpers
  async getLoginAttempts(ip: string): Promise<number> {
    const raw = await this.redis.get(`login_attempts:${ip}`);
    return raw ? parseInt(raw, 10) : 0;
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

  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload: TokenPayload = { sub: userId, email, role };

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

  private async storeRefreshToken(userId: string, token: string) {
    const raw = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    const expiresInDays = parseInt(raw.replace(/\D/g, ''), 10) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }
}

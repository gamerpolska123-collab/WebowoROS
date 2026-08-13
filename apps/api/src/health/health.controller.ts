import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get()
  async check() {
    const checks: Record<string, string> = {};
    let status = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'up';
    } catch {
      checks.database = 'down';
      status = 'degraded';
    }

    try {
      await this.redis.getClient().ping();
      checks.redis = 'up';
    } catch {
      checks.redis = 'down';
      status = 'degraded';
    }

    return { status, checks, timestamp: new Date().toISOString() };
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@ApiTags('system')
@Controller('system')
export class SystemController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'System status', description: 'Returns overall system health and version info' })
  async getStatus() {
    const startTime = Date.now();

    let dbStatus = 'ok';
    let dbLatency = 0;
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStart;
    } catch {
      dbStatus = 'error';
    }

    let redisStatus = 'ok';
    let redisLatency = 0;
    try {
      const redisStart = Date.now();
      await this.redis.ping();
      redisLatency = Date.now() - redisStart;
    } catch {
      redisStatus = 'error';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ordersToday = await this.prisma.order.count({
      where: { createdAt: { gte: today } },
    }).catch(() => 0);

    return {
      status: dbStatus === 'ok' && redisStatus === 'ok' ? 'healthy' : 'degraded',
      version: process.env.npm_package_version || '2.1.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: { status: dbStatus, latencyMs: dbLatency },
        redis: { status: redisStatus, latencyMs: redisLatency },
      },
      metrics: {
        ordersToday,
        memoryUsage: process.memoryUsage(),
      },
    };
  }

  @Get('version')
  @ApiOperation({ summary: 'API version' })
  getVersion() {
    return {
      version: '2.1.0',
      name: 'WebowoROS API',
      buildDate: '2026-08-17',
    };
  }
}

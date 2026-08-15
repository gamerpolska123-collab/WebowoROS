import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { register, contentType } from 'prom-client';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  @Get()
  @ApiOperation({ summary: 'Prometheus metrics', description: 'Returns metrics in Prometheus exposition format' })
  @ApiResponse({ status: 200, description: 'Prometheus metrics' })
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', contentType);
    res.end(await register.metrics());
  }
}

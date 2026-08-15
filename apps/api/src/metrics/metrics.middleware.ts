import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Counter, Histogram, register } from 'prom-client';

// Initialize metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'model'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
});

const errorRate = new Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status_code'],
});

// Register metrics
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);
register.registerMetric(dbQueryDuration);
register.registerMetric(errorRate);

// Export for use in other services
export { httpRequestsTotal, httpRequestDuration, dbQueryDuration, errorRate };

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const route = req.route?.path || req.path;

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const method = req.method;
      const statusCode = String(res.statusCode);

      httpRequestsTotal.inc({ method, route, status_code: statusCode });
      httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);

      if (res.statusCode >= 400) {
        errorRate.inc({ method, route, status_code: statusCode });
      }
    });

    next();
  }
}

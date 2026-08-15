import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as Sentry from '@sentry/nestjs';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { SanitizationPipe } from './common/pipes/sanitization.pipe';

async function bootstrap() {
  // Initialize Sentry
  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });
  }

  const app = await NestFactory.create(AppModule);

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('WebowoROS API')
    .setDescription('Restaurant ordering system API')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addCookieAuth('access_token', { type: 'apiKey', in: 'cookie' }, 'cookie-auth')
    .addTag('auth', 'Authentication endpoints')
    .addTag('menu', 'Public menu endpoints')
    .addTag('orders', 'Order management')
    .addTag('admin', 'Admin dashboard endpoints')
    .addTag('payments', 'Payment processing')
    .addTag('health', 'Health checks')
    .addTag('metrics', 'Prometheus metrics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Security headers (Helmet) — hardened
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "wss://ws.domena.pl", "https://api.domena.pl", "http://localhost:3000", "http://localhost:3001"],
        frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    xFrameOptions: { action: 'deny' },
    xContentTypeOptions: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  // Cookie parser
  app.use(cookieParser());

  // CORS
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://web:3000,http://dashboard:3001')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
    new SanitizationPipe(),
  );

  // Global prefix
  app.setGlobalPrefix('v1');

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`API running on port ${port}`);
  console.log(`Swagger docs: http://localhost:${port}/v1/docs`);
  console.log(`Prometheus metrics: http://localhost:${port}/v1/metrics`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();

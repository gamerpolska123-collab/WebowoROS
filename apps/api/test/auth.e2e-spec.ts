import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/v1/auth/register (POST) — should register a new user', () => {
    return request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: 'test@example.com',
        phone: '+48123456789',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe('test@example.com');
        expect(res.body.user.role).toBe('customer');
        expect(res.body.message).toBe('Registration successful');
      });
  });

  it('/v1/auth/register (POST) — should reject duplicate email', () => {
    return request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: 'test@example.com',
        phone: '+48999999999',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(409);
  });

  it('/v1/auth/login (POST) — should login and set cookies', () => {
    return request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.user).toBeDefined();
        expect(res.headers['set-cookie']).toBeDefined();
      });
  });

  it('/v1/auth/login (POST) — should reject invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
      .expect(401);
  });

  it('/v1/auth/login (POST) — should reject invalid email format', () => {
    return request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: 'not-an-email',
        password: 'password',
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
      });
  });

  it('/v1/auth/logout (POST) — should clear cookies', () => {
    return request(app.getHttpServer())
      .post('/v1/auth/logout')
      .expect(200)
      .expect((res) => {
        expect(res.headers['set-cookie']).toBeDefined();
      });
  });
});

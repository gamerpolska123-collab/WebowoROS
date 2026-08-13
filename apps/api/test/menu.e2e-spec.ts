import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MenuController (e2e)', () => {
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

  it('/v1/menu (GET) — should return full menu with categories and products', () => {
    return request(app.getHttpServer())
      .get('/v1/menu')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('name');
        expect(res.body[0]).toHaveProperty('slug');
        expect(res.body[0]).toHaveProperty('products');
        expect(Array.isArray(res.body[0].products)).toBe(true);
      });
  });

  it('/v1/menu/products/:id (GET) — should return product by id', () => {
    return request(app.getHttpServer())
      .get('/v1/menu/products/prod-margherita')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('variants');
        expect(res.body).toHaveProperty('addons');
        expect(Array.isArray(res.body.variants)).toBe(true);
        expect(Array.isArray(res.body.addons)).toBe(true);
      });
  });

  it('/v1/menu/products/:id (GET) — should return 404 for non-existent product', () => {
    return request(app.getHttpServer())
      .get('/v1/menu/products/non-existent')
      .expect(404);
  });
});

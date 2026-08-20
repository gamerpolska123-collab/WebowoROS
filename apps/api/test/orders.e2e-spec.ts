import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let authCookies: string[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth cookies
    const loginRes = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: 'admin@ros.pl',
        password: 'Admin123!',
      });

    authCookies = loginRes.headers['set-cookie'];
  });

  afterAll(async () => {
    await app.close();
  });

  it('/v1/orders (POST) — should create a new order', () => {
    return request(app.getHttpServer())
      .post('/v1/orders')
      .send({
        items: [
          {
            productId: 'prod-margherita',
            variantId: null,
            quantity: 1,
            addons: [],
          },
        ],
        deliveryType: 'delivery',
        address: {
          street: 'Testowa',
          buildingNumber: '1',
          city: 'Warszawa',
          postalCode: '00-001',
        },
        contact: {
          firstName: 'Jan',
          lastName: 'Kowalski',
          phone: '+48123456789',
          email: 'jan@example.com',
        },
        paymentMethod: 'card',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('orderNumber');
        expect(res.body.status).toBe('pending_payment');
        expect(res.body.items).toBeDefined();
      });
  });

  it('/v1/orders (POST) — should reject order with invalid product', () => {
    return request(app.getHttpServer())
      .post('/v1/orders')
      .send({
        items: [
          {
            productId: 'non-existent-product',
            quantity: 1,
          },
        ],
        deliveryType: 'delivery',
        contact: {
          firstName: 'Jan',
          lastName: 'Kowalski',
          phone: '+48123456789',
          email: 'jan@example.com',
        },
        paymentMethod: 'card',
      })
      .expect(400);
  });

  it('/v1/orders/:id (GET) — should return order by id', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/v1/orders')
      .send({
        items: [{ productId: 'prod-margherita', quantity: 1 }],
        deliveryType: 'pickup',
        contact: {
          firstName: 'Anna',
          lastName: 'Nowak',
          phone: '+48999999999',
          email: 'anna@example.com',
        },
        paymentMethod: 'cash_on_delivery',
      });

    const orderId = createRes.body.id;

    return request(app.getHttpServer())
      .get(`/v1/orders/${orderId}`)
      .set('Cookie', authCookies)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(orderId);
        expect(res.body).toHaveProperty('items');
        expect(res.body).toHaveProperty('history');
      });
  });

  it('/v1/orders/:id/status (PATCH) — should update order status', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/v1/orders')
      .send({
        items: [{ productId: 'prod-capriciosa', quantity: 1 }],
        deliveryType: 'pickup',
        contact: {
          firstName: 'Piotr',
          lastName: 'Wiśniewski',
          phone: '+48888888888',
          email: 'piotr@example.com',
        },
        paymentMethod: 'blik',
      });

    const orderId = createRes.body.id;

    return request(app.getHttpServer())
      .patch(`/v1/orders/${orderId}/status`)
      .set('Cookie', authCookies)
      .send({ status: 'confirmed', note: 'Order confirmed by kitchen' })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('confirmed');
      });
  });

  it('/v1/orders/:id/status (PATCH) — should reject invalid status transition', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/v1/orders')
      .send({
        items: [{ productId: 'prod-diavola', quantity: 1 }],
        deliveryType: 'pickup',
        contact: {
          firstName: 'Kasia',
          lastName: 'Zielińska',
          phone: '+48777777777',
          email: 'kasia@example.com',
        },
        paymentMethod: 'card',
      });

    const orderId = createRes.body.id;

    // Try invalid transition: pending_payment -> delivered (must go through paid, confirmed, preparing, ready_for_pickup)
    return request(app.getHttpServer())
      .patch(`/v1/orders/${orderId}/status`)
      .set('Cookie', authCookies)
      .send({ status: 'delivered' })
      .expect(400);
  });

  it('/v1/orders (GET) — should return user orders', () => {
    return request(app.getHttpServer())
      .get('/v1/orders')
      .set('Cookie', authCookies)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});

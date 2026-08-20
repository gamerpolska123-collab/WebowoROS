# 🏗️ HANDOFF — Architektura dla AI

## Stack technologiczny

| Warstwa | Tech | Wersja |
|---------|------|--------|
| Backend | NestJS + Prisma + PostgreSQL + Redis | 10.x + 5.x + 16 + 7 |
| Web | Next.js 14 App Router + Tailwind + shadcn/ui | 14.2.5 |
| Dashboard | Next.js 14 App Router + Tailwind + shadcn/ui | 14.2.5 |
| Printer | Node.js + Redis pub/sub + escpos | 20.x |
| Shared | TypeScript + Zod | 5.5 |
| Infra | Docker + Nginx + Docker Swarm | 24.x |

## Monorepo structure

```
WebowoROS/
├── apps/
│   ├── api/              NestJS backend
│   │   ├── src/
│   │   │   ├── auth/     JWT, refresh, RBAC
│   │   │   ├── orders/   CRUD + state machine
│   │   │   ├── menu/     Cache Redis (5min)
│   │   │   ├── admin/    CRUD + stats
│   │   │   ├── gateway/  Socket.io + Redis adapter
│   │   │   ├── health/   /v1/health (DB + Redis)
│   │   │   ├── prisma/   PrismaService
│   │   │   └── redis/    RedisService (ioredis)
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── seed-upsell.ts
│   │   └── test/         E2E (Supertest)
│   ├── web/              Next.js — klient
│   │   ├── app/
│   │   │   ├── page.tsx      Strona główna
│   │   │   ├── menu/page.tsx Menu
│   │   │   ├── bag/page.tsx  Torba
│   │   │   ├── checkout/     Kasa (refactored na moduły)
│   │   │   └── track/[orderId]/page.tsx Śledzenie
│   │   └── lib/
│   │       ├── api.ts        Klient API
│   │       ├── cart-context.tsx  Koszyk (localStorage)
│   │       └── hooks.ts      useMenu, useOrder, useCreateOrder
│   ├── dashboard/        Next.js — panel admina
│   │   ├── app/
│   │   │   ├── page.tsx      Przegląd (stats + recent orders)
│   │   │   ├── kds/page.tsx  Kitchen Display System (kanban)
│   │   │   ├── login/page.tsx Logowanie
│   │   │   ├── orders/page.tsx  [TODO] Lista zamówień
│   │   │   └── products/page.tsx [TODO] CRUD produktów
│   │   └── lib/
│   │       ├── api.ts        Klient API (dashApi)
│   │       ├── auth-context.tsx  Auth + role check
│   │       └── hooks.ts      useOrders, useStats
│   └── printer-service/  Node.js — drukarka
│       └── src/index.ts    [STUB] Redis listener
├── packages/
│   ├── shared-types/     TypeScript types + Zod schemas
│   ├── ui/               shadcn/ui + custom components
│   └── config/           ESLint, Prettier, TS base
├── infra/
│   ├── docker/           4 Dockerfile'y + 3 compose
│   └── nginx/            nginx.conf (SSL, WS, rate limit)
└── docs/                 12 plików markdown + handoff
```

## API Endpoints (NestJS, prefix /v1)

```
GET    /health              → { status, checks: {database, redis} }
POST   /auth/register       → { user, message }
POST   /auth/login          → { user, accessToken, refreshToken }
POST   /auth/logout         → { message }
GET    /auth/me             → { id, email, firstName, lastName, role }
GET    /menu                → Category[] (cached 5min)
GET    /products/:id        → Product (cached 10min)
POST   /orders              → Order (tworzy zamówienie)
GET    /orders/:id          → Order (z items, history)
GET    /orders/my           → Order[] (dla zalogowanego)
GET    /admin/orders        → Order[] (admin/kitchen/driver)
PATCH  /admin/orders/:id/status → Order (zmiana statusu)
GET    /admin/stats         → { totalOrders, todayOrders, ... }
GET    /admin/products      → Product[]
POST   /admin/products      → Product
PATCH  /admin/products/:id  → Product
DELETE /admin/products/:id  → { message }
GET    /admin/categories    → Category[]
POST   /admin/categories    → Category
PATCH  /admin/categories/:id → Category
DELETE /admin/categories/:id → { message }
```

## Order Status Flow (state machine)

```
pending_payment → paid → confirmed → preparing → ready_for_pickup → out_for_delivery → delivered
                ↓
            cancelled
```

Walidacja przejść w `orders.service.ts`.

## WebSocket Events

```
Client → Server:
  join_order { orderId }
  leave_order { orderId }
  join_kitchen
  join_driver { driverId }

Server → Client:
  order_status_changed { orderId, status, timestamp }
  new_order { orderData }
  delivery_assigned { orderData }
```

## Docker Network

```
ros-net (bridge) — dev/prod
ros-overlay (overlay) — swarm multi-host
```

Serwisy komunikują się przez nazwy DNS:
- `api:4000` → NestJS
- `postgres:5432` → PostgreSQL
- `redis:6379` → Redis
- `web:3000` → Next.js web
- `dashboard:3001` → Next.js dashboard

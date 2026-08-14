# 🤖 HANDOFF — Stan projektu WebowoROS

> Ten plik czyta TYLKO AI. Zwięźle, bez marketingu.
> Ostatnia aktualizacja: 2026-08-14 20:46

## Co zrobione (Etap 0-4 częściowo + P1 + Audyt)

### ✅ Etap 0: Infrastruktura
- Monorepo Turborepo + pnpm workspaces
- Docker: 4 Dockerfile'y (multi-stage, Alpine, standalone)
- 3 docker-compose: dev, prod, swarm (multi-host)
- Nginx: reverse proxy, SSL, WS proxy, rate limiting
- Health checks: API, PostgreSQL, Redis
- Env files: wszystkie aplikacje z Docker service names
- **NOWE:** Redis persistencja (AOF) w docker-compose

### ✅ Etap 1: Design System
- Tokens: kolory, typografia, spacing, animacje
- shadcn/ui: Button, Card, Input, Badge, Dialog, Tabs, Toast
- Custom: PizzaBag, PizzaBuilder, ProductCard, FlyToBag, UpsellModal, BundleBuilder, AddonConfigurator, CheckoutTimeline, FreeDeliveryProgress, LastMinuteAddons

### ✅ Etap 2: Backend Core
- Prisma: 17 modeli, 11 enumów, indeksy, relacje
- NestJS: Auth (JWT+refresh), RBAC (5 ról), CRUD, Redis cache, WebSocket, Zod validation
- Endpoints: /auth, /menu, /products, /orders, /admin/*, /health, /payments/*
- Testy E2E: auth, menu, orders
- **NOWE:** Soft delete (Product.isDeleted), Idempotency key (Order.idempotencyKey)
- **NOWE:** Walidacja status transition (orders + admin)
- **NOWE:** Redis publish po zmianie statusu (WebSocket + printer)
- **Naprawione błędy:** parseInt('7d'), paymentMethod as any, tip Decimal, KEYS → SCAN, UPPERCASE enumy, notes vs note

### ✅ Etap 3: Frontend Web
- **Gotowe:** layout, page, menu, bag, checkout (refactored na moduły), track
- **PWA:** Service Worker (cache API, static assets, images, offline page)
- **NOWE:** ErrorBoundary (error.tsx), Retry logic w checkout (useCreateOrder)
- **Integracja z API:** useMenu, useProduct, useOrder, useCreateOrder hooks
- **Cart context:** localStorage, dodawanie, usuwanie, ilość
- **Checkout:** 3 kroki, Zod + React Hook Form, walidacja adresu
- **Track:** timeline 7 statusów, WebSocket + fallback polling
- **Brakuje:** Background sync (IndexedDB queue), push notifications

### ✅ Etap 4: Panel Admina (P0 GOTOWE)
- **Auth Guard:** middleware JWT (`jose`) + client-side guard + strona `/forbidden`
- **Login:** działa, redirect po zalogowaniu
- **Home (stats + recent orders):** działa
- **KDS (kanban):** działa
- **Orders (`/orders`):** ✅ paginacja, filtry, akcje, modal szczegółów, WebSocket, symulator płatności, **optimistic updates**
- **Products (`/products`):** ✅ grid, search, toggle, CRUD modal (Zod + RHF), soft delete
- **Brakuje:** Zarządzanie wariantami i dodatkami produktu (TODO w modalu)

### ✅ Etap 6: Printer Service (GOTOWE)
- `escpos` + `escpos-usb` zainstalowane
- Subskrypcja Redis: `orders:new`, `kitchen:new`
- Formatowanie paragonu: nagłówek, produkty, ceny
- Drukowanie przez USB/Serial z fallback do console.log
- Graceful shutdown

### ✅ Symulator Płatności (GOTOWE)
- `POST /v1/payments/simulate` — symuluje płatność
- Przycisk w dashboard `/orders`

### ⚪ Etap 5, 7-8: Nie rozpoczęte
- Etap 5: Dostawy + KDS (dla kierowców)
- Etap 7: Płatności (Stripe/PayU) — ZOSTAWIONE NA PÓŹNIEJ
- Etap 8: Deployment (CI/CD, monitoring)

## Architektura kontenerów (Docker)

```
┌─────────────────────────────────────────┐
│              Nginx (443)                │
│  domena.pl → web:3000                  │
│  admin.domena.pl → dashboard:3001      │
│  api.domena.pl → api:4000/v1           │
│  ws.domena.pl → api:4001 (Socket.io)   │
└─────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌───────┐     ┌─────────┐     ┌──────────┐
│  web  │     │dashboard│     │   api    │
│:3000  │     │ :3001   │     │ :4000/4001│
└───────┘     └─────────┘     └────┬─────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
        ┌──────────┐         ┌─────────┐          ┌──────────┐
        │ postgres │         │  redis  │          │ printer  │
        │  :5432   │         │  :6379  │          │  :5000   │
        └──────────┘         └─────────┘          └──────────┘
```

## Pliki > 300 linii

| Plik | Linie | Uwagi |
|------|-------|-------|
| `apps/api/prisma/seed.ts` | 414 | Seed — OK |
| `docs/ui-ux.md` | 529 | Dokumentacja — OK |
| `docs/api.md` | 450 | Dokumentacja — OK |
| `apps/api/prisma/schema.prisma` | 354 | Schema — OK |
| `apps/api/src/admin/admin.service.ts` | 315 | Do rozdzielenia w przyszłości |

## Nowe pliki (tej sesji audytu)

- `apps/dashboard/app/error.tsx` — ErrorBoundary
- `apps/web/app/error.tsx` — ErrorBoundary
- `apps/web/lib/use-create-order.ts` — Retry logic
- `apps/api/src/payments/*` — Symulator płatności
- `apps/web/public/sw.js` — Service Worker

## Zmodyfikowane pliki (tej sesji audytu)

- `apps/api/prisma/schema.prisma` — isDeleted (Product), idempotencyKey (Order)
- `apps/api/src/admin/admin.service.ts` — soft delete, walidacja transition, Redis publish
- `apps/api/src/admin/admin.controller.ts` — ParseIntPipe
- `apps/api/src/orders/orders.service.ts` — idempotency key
- `apps/api/src/orders/orders.controller.ts` — idempotency key header
- `apps/api/src/products/products.service.ts` — filtr isDeleted
- `apps/dashboard/app/orders/page.tsx` — optimistic updates
- `infra/docker/docker-compose.yml` — Redis AOF persistencja

## Naprawione błędy (audyt)

### Krytyczne
1. **Soft delete Product** — `deleteProduct` usuwał na stałe → teraz `isDeleted: true`
2. **Walidacja status transition** — brak walidacji w admin → dodano `validTransitions`
3. **Redis publish z admin** — zmiany statusu nie triggerowały WS/printer → dodano publish
4. **ParseIntPipe** — `page`/`limit` jako string → teraz `ParseIntPipe + DefaultValuePipe`
5. **Redis persistencja** — brak AOF → dodano `--appendonly yes` + volume
6. **Idempotency key** — możliwe duplikaty zamówień → dodano `idempotencyKey` @unique
7. **ErrorBoundary** — brak obsługi błędów → dodano `error.tsx` w web i dashboard
8. **Retry logic** — brak retry w checkout → dodano `useCreateOrder` z exponential backoff
9. **Optimistic updates** — UI czekał na API → dodano `optimisticOrders`

## Znane braki / TODO (do rozłożenia na etapy)

### 🔴 Etap A: Security Hardening (dużo pracy)
- Rate limiting (`@nestjs/throttler`) — wszystkie kontrolery
- CSRF protection — tokeny w formularzach
- Helmet — security headers (CSP, HSTS, X-Frame-Options)
- Brute force protection — Redis-based login attempt tracking
- Input sanitization — XSS prevention
- **Szacunek:** 4-6h

### 🟡 Etap B: API Documentation (średnia praca)
- Swagger/OpenAPI — `@ApiTags`, `@ApiOperation`, `@ApiResponse`
- DTO schemas w Swagger
- **Szacunek:** 2-3h

### 🟡 Etap C: Upload obrazków (średnia praca)
- Multer/S3/Cloudinary — upload zamiast URL
- Image optimization (sharp) — webp, resize
- CDN — CloudFront/Cloudflare
- **Szacunek:** 3-4h

### 🟢 Etap D: Monitoring & Analytics (dużo pracy)
- Prometheus + Grafana — metrics, dashboards
- Sentry — error tracking, source maps
- Google Analytics / Plausible — web tracking
- Health checks dashboard
- **Szacunek:** 4-6h

### 🟢 Etap E: PWA ulepszenia (średnia praca)
- Background Sync — IndexedDB queue dla zamówień offline
- Push notifications — Web Push API
- Manifest.json — ikony, theme-color
- **Szacunek:** 3-4h

### 🟢 Etap F: Zarządzanie wariantami/dodatkami (mała praca)
- Modal w products dla wariantów i dodatków
- Backend: osobne endpointy lub rozszerzenie updateProduct
- **Szacunek:** 2h

## Komendy szybkiego startu

```bash
# Dev
cd infra/docker && docker-compose up -d

# Prod
cd infra/docker && docker-compose -f docker-compose.prod.yml up -d

# Swarm
cd infra/docker && docker stack deploy -c docker-compose.swarm.yml weboworos
```

## Struktura plików handoff

```
docs/
  handoff-current.md   ← TEN PLIK
  handoff-next.md      ← Zadania dla kolejnej AI
  handoff-arch.md      ← Architektura
```

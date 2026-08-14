# 🎯 HANDOFF — Zadania dla kolejnej AI

> Priorytetowana lista. Zacznij od góry.
> Ostatnia aktualizacja: 2026-08-14 20:48

## ✅ P0 — GOTOWE
- Dashboard Auth Guard
- Dashboard /orders (paginacja, filtry, WebSocket, optimistic updates)
- Dashboard /products (CRUD, soft delete, Zod + RHF)
- Symulator płatności
- Printer Service
- PWA Service Worker

## 🔴 Etap A: Security Hardening (PRIORYTET — dużo pracy)

### A1. Rate Limiting
**Pliki:** `apps/api/src/app.module.ts`, wszystkie kontrolery
- Zainstaluj `@nestjs/throttler`
- Dodaj `ThrottlerModule.forRoot()` w app.module
- Dodaj `@UseGuards(ThrottlerGuard)` do wszystkich kontrolerów
- Konfiguracja: 10 req/s na IP, 100 req/min na user

### A2. CSRF Protection
**Pliki:** `apps/api/src/main.ts`, `apps/web/lib/api.ts`, `apps/dashboard/lib/api.ts`
- Zainstaluj `csurf`
- Dodaj CSRF token do cookies
- Dodaj `X-CSRF-Token` header do każdego POST/PATCH/DELETE

### A3. Helmet
**Pliki:** `apps/api/src/main.ts`
- Zainstaluj `helmet`
- Skonfiguruj CSP, HSTS, X-Frame-Options, X-Content-Type-Options

### A4. Brute Force Protection
**Pliki:** `apps/api/src/auth/auth.service.ts`, `apps/api/src/redis/redis.service.ts`
- Trackuj próby logowania w Redis (key: `login_attempts:<ip>`)
- Blokuj IP po 5 nieudanych próbach (15 min)
- Dodaj `X-RateLimit-Remaining` header

### A5. Input Sanitization
**Pliki:** `apps/api/src/common/pipes/`, wszystkie DTO
- Zainstaluj `dompurify` lub `xss`
- Sanituj wszystkie string inputs
- Waliduj JSON fields (address, contact)

**Szacunek:** 4-6h

## 🟡 Etap B: API Documentation

### B1. Swagger/OpenAPI
**Pliki:** Wszystkie kontrolery
- Dodaj `@ApiTags('auth')`, `@ApiTags('orders')`, itp.
- Dodaj `@ApiOperation({ summary: '...' })`
- Dodaj `@ApiResponse({ status: 200, description: '...' })`
- Skonfiguruj `SwaggerModule` w `main.ts`

**Szacunek:** 2-3h

## 🟡 Etap C: Upload obrazków

### C1. Image Upload
**Pliki:** `apps/api/src/admin/admin.controller.ts`, `apps/dashboard/app/products/`
- Zainstaluj `@nestjs/platform-express` + `multer`
- Endpoint `POST /admin/products/:id/image`
- Upload do S3/Cloudinary lub lokalnie
- **ALTERNATYWNIE:** Użyj pre-signed URLs do S3 (bezpieczniejsze)

### C2. Image Optimization
**Pliki:** `apps/web/next.config.js`
- Zainstaluj `sharp`
- Next.js Image component z `loader: 'custom'`
- WebP conversion, responsive sizes

**Szacunek:** 3-4h

## 🟢 Etap D: Monitoring & Analytics

### D1. Prometheus + Grafana
**Pliki:** `apps/api/src/metrics/`
- Zainstaluj `prom-client`
- Metryki: request count, response time, error rate, DB query time
- Endpoint `/metrics` dla Prometheus
- Grafana dashboard JSON

### D2. Sentry
**Pliki:** `apps/web/`, `apps/dashboard/`, `apps/api/`
- Zainstaluj `@sentry/nextjs`, `@sentry/nestjs`
- Source maps upload
- Error tracking, performance monitoring

### D3. Analytics
**Pliki:** `apps/web/app/layout.tsx`
- Google Analytics 4 lub Plausible
- Event tracking: add_to_cart, begin_checkout, purchase

**Szacunek:** 4-6h

## 🟢 Etap E: PWA ulepszenia

### E1. Background Sync
**Pliki:** `apps/web/public/sw.js`, `apps/web/lib/`
- IndexedDB queue dla zamówień offline
- Retry w tle gdy wraca połączenie
- Notification: "Zamówienie wysłane!"

### E2. Push Notifications
**Pliki:** `apps/web/public/sw.js`, `apps/api/src/notifications/`
- Web Push API — subskrypcja
- Wysyłanie przy zmianie statusu zamówienia
- Badge count na ikonie

### E3. Manifest
**Pliki:** `apps/web/public/manifest.json`
- Ikony 192x192, 512x512
- Theme color, background color
- Display: standalone

**Szacunek:** 3-4h

## 🟢 Etap F: Zarządzanie wariantami/dodatkami

### F1. Frontend
**Pliki:** `apps/dashboard/app/products/components/`
- Modal/sekcja dla wariantów (nazwa, priceAdjustment, isActive)
- Modal/sekcja dla dodatków (nazwa, cena, maxQuantity, isActive)

### F2. Backend
**Pliki:** `apps/api/src/admin/admin.controller.ts`, `apps/api/src/admin/admin.service.ts`
- `POST /admin/products/:id/variants`
- `POST /admin/products/:id/addons`
- `PATCH /admin/variants/:id`
- `DELETE /admin/variants/:id` (soft delete)

**Szacunek:** 2h

## 📝 Notatki techniczne

### Docker
- Nazwy serwisów: `api:4000`, `postgres:5432`, `redis:6379`
- NIE `localhost`

### Prisma
- `pnpm --filter api db:generate` po zmianie schema
- `pnpm --filter api db:migrate` po zmianie modeli

### Redis
- Cache: `redis.setex(key, 300, JSON.stringify(data))`
- Pub/sub: `redis.publish('orders:new', JSON.stringify(order))`

### WebSocket
- Client: `socket.io-client`
- Server: `@nestjs/websockets` + `socket.io`
- Rooms: `order:<id>`, `kitchen`, `driver:<id>`

### Auth
- JWT w HttpOnly cookie
- RBAC: `@Roles('admin')` + `RolesGuard`

### Typy
- Prisma enumy lowercase: `pending_payment`, `paid`, itp.
- Unikaj `any`

### Płatności
- **SYMULATOR:** `POST /v1/payments/simulate`
- **PRODUKCJA:** Stripe/PayU do podpięcia później

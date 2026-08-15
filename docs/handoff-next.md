# 🎯 HANDOFF — Zadania dla kolejnej AI

> Priorytetowana lista. Zacznij od góry.
> Ostatnia aktualizacja: 2026-08-15 12:06

## ✅ P0 — GOTOWE
- Dashboard Auth Guard
- Dashboard /orders (paginacja, filtry, WebSocket, optimistic updates)
- Dashboard /products (CRUD, soft delete, Zod + RHF)
- Symulator płatności
- Printer Service
- PWA Service Worker
- Etap A: Security Hardening — Rate limiting, CSRF, Helmet, Brute force, Input sanitization
- Etap B: API Documentation — Swagger/OpenAPI na wszystkich kontrolerach + DTO classes

## 🟡 Etap C: Upload obrazków (PRIORYTET — średnia praca)

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

## 🟢 Etap D: Monitoring & Analytics (dużo pracy)

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

## 🟢 Etap E: PWA ulepszenia (średnia praca)

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

## 🟢 Etap F: Zarządzanie wariantami/dodatkami (mała praca)

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
- Brute force: `redis.incr('login_attempts:<ip>')`, `redis.expire(key, 900)`

### WebSocket
- Client: `socket.io-client`
- Server: `@nestjs/websockets` + `socket.io`
- Rooms: `order:<id>`, `kitchen`, `driver:<id>`

### Auth
- JWT w HttpOnly cookie
- RBAC: `@Roles('admin')` + `RolesGuard`
- CSRF: double-submit cookie, endpoint `/auth/csrf`, header `X-CSRF-Token`
- Brute force: 5 prób / 15 min, key `login_attempts:<ip>`

### Swagger
- Dostępne pod: `http://api:4000/v1/docs`
- BearerAuth + CookieAuth skonfigurowane
- Wszystkie kontrolery ozdobione `@ApiTags`, `@ApiOperation`, `@ApiResponse`
- DTO classes z `@ApiProperty` obok Zod schemas

### Typy
- Prisma enumy lowercase: `pending_payment`, `paid`, itp.
- Unikaj `any`

### Płatności
- **SYMULATOR:** `POST /v1/payments/simulate`
- **PRODUKCJA:** Stripe/PayU do podpięcia później

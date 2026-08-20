# 🎯 HANDOFF — Zadania dla kolejnej AI

> Priorytetowana lista. Zacznij od góry.
> Ostatnia aktualizacja: 2026-08-15 12:31

## ✅ P0 — GOTOWE
- Dashboard Auth Guard
- Dashboard /orders (paginacja, filtry, WebSocket, optimistic updates)
- Dashboard /products (CRUD, soft delete, Zod + RHF)
- Symulator płatności
- Printer Service
- PWA Service Worker
- Etap A: Security Hardening
- Etap B: API Documentation / Swagger
- Etap C: Upload obrazków
- Etap D: Monitoring & Analytics — Prometheus, Sentry, Plausible
- Skrypt startowy `start.sh` — interaktywna konfiguracja + bezpieczny start

## 🟢 Etap E: PWA ulepszenia (PRIORYTET — średnia praca)

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
- Uploads volume: `uploads_data` → `/app/uploads` w API

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

### Upload obrazków
- Endpoint: `POST /v1/admin/products/:id/image`
- Akceptowane: JPEG, PNG, WebP (max 5MB)
- Generowane warianty: original, thumbnail, WebP

### Skrypt startowy
- `./start.sh` — interaktywna konfiguracja + uruchomienie całego stacku
- Sprawdza Docker, pnpm, Node.js
- Generuje JWT_SECRET, tworzy .env, uruchamia docker-compose

### Monitoring
- Prometheus metrics: `GET /v1/metrics`
- Sentry: API (`SENTRY_DSN`), web/dashboard (`NEXT_PUBLIC_SENTRY_DSN`)
- Plausible: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

### Typy
- Prisma enumy lowercase: `pending_payment`, `paid`, itp.
- Unikaj `any`

### Płatności
- **SYMULATOR:** `POST /v1/payments/simulate`
- **PRODUKCJA:** Stripe/PayU do podpięcia później

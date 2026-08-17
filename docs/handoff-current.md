# 🤖 HANDOFF — Stan projektu WebowoROS

> Ten plik czyta TYLKO AI. Zwięźle, bez marketingu.
> Ostatnia aktualizacja: 2026-08-15 01:37

## Co zrobione (Etap 0-4 + P1 + Audyt + Etap A)

### ✅ Etap 0: Infrastruktura
- Monorepo Turborepo + pnpm workspaces
- Docker: 4 Dockerfile'y (multi-stage, Alpine, standalone)
- 3 docker-compose: dev, prod, swarm (multi-host)
- Nginx: reverse proxy, SSL, WS proxy, rate limiting
- Health checks: API, PostgreSQL, Redis
- Env files: wszystkie aplikacje z Docker service names
- Redis persistencja (AOF) w docker-compose

### ✅ Etap 1: Design System
- Tokens: kolory, typografia, spacing, animacje
- shadcn/ui: Button, Card, Input, Badge, Dialog, Tabs, Toast
- Custom: PizzaBag, PizzaBuilder, ProductCard, FlyToBag, UpsellModal, BundleBuilder, AddonConfigurator, CheckoutTimeline, FreeDeliveryProgress, LastMinuteAddons

### ✅ Etap 2: Backend Core
- Prisma: 17 modeli, 11 enumów, indeksy, relacje
- NestJS: Auth (JWT+refresh), RBAC (5 ról), CRUD, Redis cache, WebSocket, Zod validation
- Endpoints: /auth, /menu, /products, /orders, /admin/*, /health, /payments/*
- Testy E2E: auth, menu, orders
- Soft delete (Product.isDeleted), Idempotency key (Order.idempotencyKey)
- Walidacja status transition (orders + admin)
- Redis publish po zmianie statusu (WebSocket + printer)
- Naprawione błędy: parseInt('7d'), paymentMethod as any, tip Decimal, KEYS → SCAN, UPPERCASE enumy, notes vs note

### ✅ Etap 3: Frontend Web
- layout, page, menu, bag, checkout (refactored na moduły), track
- PWA: Service Worker (cache API, static assets, images, offline page)
- ErrorBoundary (error.tsx), Retry logic w checkout (useCreateOrder)
- Integracja z API: useMenu, useProduct, useOrder, useCreateOrder hooks
- Cart context: localStorage, dodawanie, usuwanie, ilość
- Checkout: 3 kroki, Zod + React Hook Form, walidacja adresu
- Track: timeline 7 statusów, WebSocket + fallback polling
- Brakuje: Background sync (IndexedDB queue), push notifications

### ✅ Etap 4: Panel Admina (P0 GOTOWE)
- Auth Guard: middleware JWT (jose) + client-side guard + strona /forbidden
- Login: działa, redirect po zalogowaniu
- Home (stats + recent orders): działa
- KDS (kanban): działa
- Orders (/orders): paginacja, filtry, akcje, modal szczegółów, WebSocket, symulator płatności, optimistic updates
- Products (/products): grid, search, toggle, CRUD modal (Zod + RHF), soft delete
- Brakuje: Zarządzanie wariantami i dodatkami produktu (TODO w modalu)

### ✅ Etap 6: Printer Service (GOTOWE)
- escpos + escpos-usb zainstalowane
- Subskrypcja Redis: orders:new, kitchen:new
- Formatowanie paragonu: nagłówek, produkty, ceny
- Drukowanie przez USB/Serial z fallback do console.log
- Graceful shutdown

### ✅ Symulator Płatności (GOTOWE)
- POST /v1/payments/simulate — symuluje płatność
- Przycisk w dashboard /orders

### ✅ PWA: Service Worker (GOTOWE)
- Cache API, static assets, images, offline page

### ✅ Skrypt startowy — `start.sh` (GOTOWE)

- Interaktywny skrypt bash do bezpiecznego uruchamiania całego stacku
- Sprawdza wymagane narzędzia (Docker, docker-compose, pnpm, Node.js)
- Konfiguruje pliki `.env` dla API, web, dashboard (na podstawie pytań)
- Generuje losowy `JWT_SECRET` (64 znaki) jeśli nie podany przez użytkownika
- Obsługuje opcjonalne: SENTRY_DSN, Plausible domain, CORS origins
- Instaluje zależności (`pnpm install`)
- Generuje Prisma Client
- Uruchamia Docker Compose (`infra/docker/docker-compose.yml`)
- Czeka na gotowość: PostgreSQL, Redis, API (health check)
- Wyświetla podsumowanie z URL-ami i przydatnymi komendami
- Ustawia `chmod 600` na `.env` (API) dla bezpieczeństwa

```bash
./start.sh
```

### ✅ Etap D: Monitoring & Analytics (GOTOWE)

#### D1. Prometheus + Grafana
- `prom-client ^15.1.3` dodane do API
- Nowy moduł: `metrics/metrics.module.ts` + `metrics.controller.ts` + `metrics.middleware.ts`
- Endpoint: `GET /v1/metrics` — zwraca metryki w formacie Prometheus
- Metryki zbierane:
  - `http_requests_total` — licznik requestów (labels: method, route, status_code)
  - `http_request_duration_seconds` — histogram czasu odpowiedzi (buckets: 5ms–10s)
  - `http_errors_total` — licznik błędów HTTP (status >= 400)
  - `db_query_duration_seconds` — histogram czasu zapytań DB (labels: operation, model)
- `MetricsMiddleware` aplikowany globalnie na wszystkie route'y

#### D2. Sentry
- `@sentry/nestjs ^8.26.0` w API — init w `main.ts` (conditional na `SENTRY_DSN`)
- `@sentry/nextjs ^8.26.0` w web i dashboard:
  - `next.config.js` — `withSentryConfig` wrapper
  - `instrumentation.ts` — server-side Sentry init
  - `sentry.client.config.ts` — client-side init + session replay
- Config: `tracesSampleRate` 0.1 w prod / 1.0 w dev, `replaysOnErrorSampleRate: 1.0`
- Env vars: `SENTRY_DSN` (API), `NEXT_PUBLIC_SENTRY_DSN` (web/dashboard), `SENTRY_ORG`, `SENTRY_PROJECT_WEB`, `SENTRY_PROJECT_DASHBOARD`

#### D3. Analytics (Plausible)
- Plausible script dodany do `web/app/layout.tsx`
- Konfigurowalne przez env:
  - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — domena do śledzenia
  - `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL` — URL skryptu (default: plausible.io)
- Privacy-friendly — brak cookies, GDPR-compliant

### ✅ Etap C: Upload obrazków (GOTOWE)

#### C1. Image Upload (Backend)
- `multer ^1.4.5-lts.1` + `@types/multer` dodane do API
- Nowy moduł: `upload/upload.module.ts` + `upload/upload.service.ts`
- `UploadService` — obsługa multera (memoryStorage), walidacja typu (JPEG/PNG/WebP), max 5MB
- `processAndSaveImage()` — generuje 3 warianty:
  - Original: resize max 1200px, JPEG quality 85%
  - Thumbnail: 300x300 cover, JPEG quality 80%
  - WebP: resize max 800px, WebP quality 80%
- Endpoint: `POST /v1/admin/products/:id/image` (admin only)
- Po uploadzie aktualizuje `Product.imageUrl` w Prisma
- `UploadModule` zarejestrowany w `app.module.ts`
- Dodano `uuid ^10.0.0` + `@types/uuid`

#### C2. Image Optimization (Frontend)
- `sharp ^0.33.5` dodane do web i dashboard
- `next.config.js` w web i dashboard:
  - `remotePatterns` dla `/uploads/**` z API
  - `formats: ['image/webp', 'image/avif']`
  - `deviceSizes` i `imageSizes` dla responsywnych obrazków

#### C3. Docker
- Naprawiono błędy w `docker-compose.yml` (usunięto malformed `redis-data:` entries)
- Dodano `uploads_data` volume współdzielony z API (`/app/uploads`)
- Dodano `UPLOAD_BASE_URL=/uploads/products` env var
- Dodano `redis-server --appendonly yes` do Redis

### ✅ Etap B: API Documentation / Swagger (GOTOWE)

#### B1. Swagger/OpenAPI Setup
- `@nestjs/swagger ^7.4.0` dodane do zależności
- `SwaggerModule` skonfigurowany w `main.ts` — endpoint `/v1/docs`
- `DocumentBuilder` z title, description, version, BearerAuth, CookieAuth
- `swaggerOptions`: persistAuthorization, tagsSorter, operationsSorter

#### B2. Kontrolery ozdobione dekoratorami
| Kontroler | Tag | Dekoratory |
|-----------|-----|------------|
| `auth.controller.ts` | `auth` | `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`, `@ApiCookieAuth` |
| `menu.controller.ts` | `menu` | `@ApiOperation`, `@ApiResponse` |
| `orders.controller.ts` | `orders` | `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`, `@ApiCookieAuth` |
| `admin.controller.ts` | `admin` | `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`, `@ApiCookieAuth`, `@ApiQuery` (filtry) |
| `payments.controller.ts` | `payments` | `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`, `@ApiCookieAuth`, `@ApiParam` |
| `health.controller.ts` | `health` | `@ApiOperation`, `@ApiResponse` |

#### B3. Klasy DTO z `@ApiProperty`
- `auth/auth.dto.ts` — `RegisterDtoClass`, `LoginDtoClass`, `RefreshTokenDtoClass`, `CsrfResponseDto`, `AuthUserResponseDto`, `RegisterResponseDto`, `LoginResponseDto`, `MessageResponseDto`
- `orders/order.dto.ts` — `CreateOrderDtoClass`, `UpdateOrderStatusDtoClass`, `AddressDto`, `ContactDto`, `OrderItemDto`, `OrderItemAddonDto`
- `payments/payments.controller.ts` — `SimulatePaymentDtoClass`, `PaymentStatusResponseDto`, `SimulatePaymentResponseDto`
- Zod schemas pozostają bez zmian (runtime validation)
- Klasy Swagger są używane tylko do dokumentacji (type hints w `@ApiResponse`)

- Cache API, static assets, images, offline page

### ✅ Etap A: Security Hardening (GOTOWE)

#### A1. Rate Limiting
- ThrottlerGuard jako globalny APP_GUARD (przed JWT, CSRF, Roles)
- Konfiguracja: 10 req/s (ttl: 1000ms) + 100 req/min (ttl: 60000ms)

#### A2. CSRF Protection
- Double-submit cookie pattern
- Endpoint GET /v1/auth/csrf — generuje token, zapisuje w cookie (non-httpOnly)
- CsrfGuard — weryfikuje X-CSRF-Token header vs csrf_token cookie na wszystkich mutujących requestach (POST/PATCH/PUT/DELETE)
- Frontend (web + dashboard): fetchCsrfToken() przed mutującym requestem, dodaje X-CSRF-Token header
- Logout czyści csrf_token cookie

#### A3. Helmet Hardening
- CSP (istniejące) + nowe: HSTS (maxAge: 1y, includeSubDomains, preload), X-Frame-Options: deny, X-Content-Type-Options, referrerPolicy: strict-origin-when-cross-origin

#### A4. Brute Force Protection
- Redis-based: key login_attempts:<ip>
- Blokada po 5 nieudanych próbach (15 min TTL)
- auth.service.login() przyjmuje IP, sprawdza attempts przed walidacją hasła
- Nieudane próby: incr + expire, udane: del
- Header X-RateLimit-Remaining w odpowiedzi na login
- auth.controller: getClientIp() (X-Forwarded-For → req.ip)

#### A5. Input Sanitization
- Globalny SanitizationPipe (main.ts) — używa xss (filterXSS)
- Strip all HTML tags, stripIgnoreTagBody: ['script']
- Rekursywna sanitacja stringów w obiektach i tablicach
- Globalny ValidationPipe (whitelist, forbidNonWhitelisted, transform)
- Dodano zależność: xss ^1.0.15

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

## Nowe pliki (tej sesji)

- `apps/api/src/common/pipes/sanitization.pipe.ts` — XSS sanitization pipe
- `apps/api/src/common/guards/csrf.guard.ts` — CSRF double-submit cookie guard

## Zmodyfikowane pliki (tej sesji)

- `apps/api/package.json` — dodano xss, naprawiono lint quotes
- `apps/api/src/app.module.ts` — ThrottlerGuard + CsrfGuard jako APP_GUARD
- `apps/api/src/main.ts` — Helmet hardened, global ValidationPipe + SanitizationPipe, CORS allowedHeaders + X-CSRF-Token
- `apps/api/src/auth/auth.service.ts` — brute force protection (Redis-based)
- `apps/api/src/auth/auth.controller.ts` — /csrf endpoint, IP tracking, X-RateLimit-Remaining header
- `apps/api/src/redis/redis.service.ts` — dodano incr, expire, ttl
- `apps/web/lib/api.ts` — fetchCsrfToken + X-CSRF-Token header na mutujących requestach
- `apps/dashboard/lib/api.ts` — fetchCsrfToken + X-CSRF-Token header na mutujących requestach

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


---

## 🔧 POPRAWKI FAZA 1 — 2026-08-16

### Naprawione błędy krytyczne:

1. **Importy pakietów** — zamieniono `@weboworos/ui` → `@ros/ui` i `@weboworos/shared-types` → `@ros/shared-types` we wszystkich plikach `.ts/.tsx` (8 plików)

2. **JWT TTL parser** — `auth.service.ts`: zamieniono błędny `parseInt(raw.replace(/\D/g, ''))` na pełny parser obsługujący `m/h/d/w/M/y` (np. `15m` = 15 minut, nie 15 dni)

3. **Prisma transaction** — `orders.service.ts`: `createOrder` owinięty w `prisma.$transaction()` — atomowość tworzenia zamówienia + historii + itemów

4. **JWT Guard Bearer fallback** — `jwt-auth.guard.ts`: dodano fallback do headera `Authorization: Bearer <token>` (Swagger UI działa poprawnie)

5. **Logout autentykacja** — `auth.controller.ts`: dodano `@UseGuards(JwtAuthGuard)` do endpointu logout

6. **Dockerfile.dev** — dodano `npm run build` dla `@ros/shared-types` i `@ros/ui` przed Prisma generate (brakowało `dist/`)

7. **docker-compose.yml** — usunięto obsolete `version: '3.8'`

### Zmiany w zależnościach:
- `eslint-plugin-react-hooks` 4.6.2 → 5.1.0 (wsparcie ESLint 9)
- `typescript-eslint` 8.1.0 → 8.18.0
- `eslint-plugin-react` 7.35.0 → 7.37.0
- `typescript` ujednolicono do `^5.5.4` w root
- `prettier` ujednolicono do `^3.3.3` w root
- `zod` ujednolicono do `^3.23.8` w web
- `lucide-react` ujednolicono do `^0.427.0` w ui
- `react`/`react-dom` peer deps ujednolicono do `^18.3.1` w ui
- Usunięto `pnpm-workspace.yaml` (migracja pnpm → npm)
- Usunięto `packageManager: pnpm` i `engines.pnpm` z root package.json

### Pozostałe do zrobienia (Faza 2):
- [ ] Wygenerować pełny `package-lock.json` (`npm install` wymagało stabilnego środowiska)
- [ ] Dodać autentykację WebSocket Gateway (`handleConnection` middleware)
- [ ] Zamienić `Math.random()` na sekwencję PostgreSQL dla `orderNumber`
- [ ] Dodać Origin/Referer check do CSRF Guard
- [ ] Walidacja `minOrderValue` w `createOrder`
- [ ] Prawdziwa integracja płatności (Stripe/PayU) — obecnie tylko symulacja
- [ ] Kolejność APP_GUARD: Throttler powinien być pierwszy


---

---

---

## 🔧 POPRAWKI FAZA 1 — KOMPLETNA LISTA (2026-08-17)

### Naprawione błędy krytyczne (kompilacja + runtime):

1. **Importy pakietów** — zamieniono `@weboworos/ui` → `@ros/ui` i `@weboworos/shared-types` → `@ros/shared-types`
2. **Eksporty komponentów UI** — `export default` → `export function` (index.ts używa `export *`)
3. **Usunięto `next/image`** z `packages/ui` — zamieniono na `<img>`
4. **Usunięto błędny alias `@/`** z `pizza-builder.tsx`
5. **Dodano `exports`** do `packages/ui/package.json` (`./styles/*`, `./tokens`)
6. **`main`/`types` → `./src/index.ts`** — `dist/` nie istnieje w repo
7. **Dodano `transpilePackages`** do `next.config.js` (web + dashboard)
8. **Dodano `paths['@ros/*']`** do `tsconfig.json` (web + dashboard + api)
9. **Dodano typ `Order`** do `shared-types` (alias `extends OrderResponse`)
10. **Naprawiono `animations.css`** — usunięto `@layer utilities`
11. **Naprawiono TTL parser** w `auth.service.ts`
12. **`createOrder` w `prisma.$transaction()`**
13. **JWT Bearer fallback** w `jwt-auth.guard.ts`
14. **Logout guard** w `auth.controller.ts`
15. **`Dockerfile.dev`** — usunięto `package-lock.json` z COPY, usunięto `db:generate` z build
16. **`docker-compose.yml`** — dodano `db:generate` do command api, usunięto `version: '3.8'`, zamieniono `migrate:dev` na `db:migrate`
17. **Skrypty npm** — dodano `clean`/`test` do wszystkich package.json
18. **`packages/config/package.json`** — dodano wszystkie skrypty
19. **`apps/printer-service/.env`** — utworzono
20. **Usunięto `pnpm-workspace.yaml`**
21. **Ujednolicenie zależności** — ESLint, React, zod, lucide-react, typescript, prettier

### Naprawione błędy infrastrukturalne:

22. **`Dockerfile.dev` — `node:20-alpine` → `node:20-slim`** — Prisma ma znane problemy z OpenSSL na Alpine ARM64 (Raspberry Pi). Debian Slim ma wbudowane OpenSSL.
23. **`docker-compose.yml` — `--hostname 0.0.0.0`** dla web i dashboard — Next.js dev server domyślnie nasłuchuje tylko na `localhost`, przez co nie jest dostępny z innych urządzeń w sieci lokalnej.

### Znane ostrzeżenia (nie błędy):
- `Prisma failed to detect libssl` — na Alpine (już nieaktualne po zmianie na Slim)
- `fonts.gstatic.com failed` — brak internetu na RPi, użyje fallback fontu
- `Sentry global error handler` — można pominąć lub dodać `SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING=1`

### Pozostałe do zrobienia (Faza 2+):
- [ ] Autentykacja WebSocket Gateway (`handleConnection` middleware)
- [ ] Zamienić `Math.random()` na sekwencję PostgreSQL dla `orderNumber`
- [ ] Origin/Referer check w CSRF Guard
- [ ] Walidacja `minOrderValue` w `createOrder`
- [ ] Kolejność APP_GUARD: Throttler powinien być pierwszy
- [ ] Prawdziwe płatności Stripe/PayU (obecnie symulacja)
- [ ] KDS — aktualizacje real-time
- [ ] Management dostawców
- [ ] Testy E2E (Playwright)
- [ ] CI/CD pipeline (GitHub Actions)

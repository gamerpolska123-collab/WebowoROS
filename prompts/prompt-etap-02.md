# PROMPT: ETAP 2 — Core Backend i Baza Danych

Wykonaj ETAP 2 projektu Restaurant Order System.

## Cel
Działające API NestJS + PostgreSQL + Redis + WebSocket.

## Zadania:

### Zadanie 1: Schema Prisma
- `apps/api/prisma/schema.prisma` — pełny ERD:
  - Category, Product, Variant, ProductAddon
  - Order, OrderItem, OrderItemAddon
  - User (role: guest, customer, kitchen, driver, admin)
  - UpsellConfig, BundleConfig, PromoConfig, ProductBadge
  - PriceHistory, SiteConfig
- Relacje: 1:N, N:M gdzie potrzebne

### Zadanie 2: Migracje i Seedery
- `prisma/migrations/` — pierwsza migracja
- `prisma/seed.ts` — przykładowe menu (pizza, makarony, zupy, napoje, dodatki)
- `prisma/seed-upsell.ts` — przykładowe konfiguracje upsellu

### Zadanie 3: API Endpoints (REST)
- `GET /menu` — lista kategorii + produktów + wariantów + dodatków + badge'y
- `GET /menu/products/:id` — szczegóły produktu
- `POST /orders` — tworzenie zamówienia (z walidacją Zod)
- `GET /orders/:id` — szczegóły zamówienia
- `PATCH /orders/:id/status` — zmiana statusu
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- `GET /admin/products`, `POST /admin/products`, `PUT /admin/products/:id`, `PATCH /admin/products/:id/price`
- `GET /admin/upsell-configs`, `POST /admin/upsell-configs`
- `GET /admin/bundles`, `POST /admin/bundles`
- `GET /admin/promos`, `POST /admin/promos`
- `GET /admin/site-config`, `PUT /admin/site-config`

### Zadanie 4: WebSocket Gateway
- `apps/api/src/gateway/order.gateway.ts` — Socket.io
- Events: join_order_room, order_status_changed, price_updated, product_unavailable, config_updated

### Zadanie 5: Autentykacja
- JWT strategy (access token 15min, refresh token 7d)
- HttpOnly cookies (Secure, SameSite=Strict)
- RBAC guards (RolesGuard)

### Zadanie 6: Testy
- Testy integracyjne dla wszystkich endpointów (Jest + Supertest)
- Coverage > 80%

## Po zakończeniu:
ZAPISZ STAN PRACY w README-AI.md:
- "Etap 2 — Kod: Zakończony"
- Lista endpointów + status testów
- Decyzje architektoniczne

Nie przechodź do Etapu 3 bez mojej zgody.
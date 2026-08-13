# 🎯 HANDOFF — Zadania dla kolejnej AI

> Priorytetowana lista. Zacznij od góry.

## 🔴 P0 — Krytyczne (blokujące)

### 1. Dashboard Auth Guard
**Pliki:** `apps/dashboard/app/layout.tsx`, nowy `apps/dashboard/middleware.ts`
- Dodaj middleware sprawdzający JWT cookie
- Jeśli brak tokena → redirect `/login`
- Jeśli rola ≠ admin/kitchen/driver → 403
- **Wskazówka:** Użyj `dashApi.me()` w middleware lub layout

### 2. Dashboard /orders — pełna lista
**Pliki:** `apps/dashboard/app/orders/page.tsx`
- Tabela z paginacją (20 na stronę)
- Filtry: status, data, typ dostawy
- Akcje: zmiana statusu, anulowanie, podgląd szczegółów
- WebSocket: auto-refresh przy nowym zamówieniu
- **Wskazówka:** Użyj `dashApi.getOrders()` + `dashApi.updateOrderStatus()`

### 3. Dashboard /products — CRUD
**Pliki:** `apps/dashboard/app/products/page.tsx`
- Grid produktów z search
- Toggle `isAvailable`
- Modal edycji: nazwa, cena, opis, obraz, kategoria, warianty, dodatki
- Dodawanie nowego produktu
- **Wskazówka:** Użyj `dashApi.getProducts()`, `dashApi.updateProduct()`, `dashApi.createProduct()`

## 🟡 P1 — Ważne

### 4. Printer Service (Etap 6)
**Pliki:** `apps/printer-service/src/index.ts`
- Zainstaluj `node-escpos` lub `escpos`
- Nasłuchuj Redis channel `orders:new`
- Formatuj paragon: nagłówek, produkty, ceny, adres
- Drukuj przez USB/Serial
- **Wskazówka:** Użyj `escpos.USB()` lub `escpos.Serial()`

### 5. Płatności online (Etap 7)
**Pliki:** `apps/api/src/payments/`
- Nowy moduł NestJS: `payments.module.ts`, `payments.service.ts`, `payments.controller.ts`
- Stripe: `stripe.confirmPayment()`, webhooks
- PayU: OAuth + createOrder + notify
- Aktualizuj `orders.service.ts`: po płatności zmień status na `paid`
- **Wskazówka:** Użyj `@nestjs/stripe` lub `stripe` SDK bezpośrednio

### 6. PWA — Service Worker
**Pliki:** `apps/web/public/sw.js`, `apps/web/app/layout.tsx`
- Cache menu, obrazków, CSS
- Offline mode: wyświetl "Brak połączenia" zamiast błędu
- Background sync: zamówienia w kolejce offline
- **Wskazówka:** Użyj Workbox lub custom SW

## 🟢 P2 — Nice to have

### 7. Push Notifications
- Web Push API: subskrypcja, wysyłanie przy zmianie statusu
- OneSignal lub custom

### 8. Real-time map (Etap 5)
- Leaflet / Mapbox: pozycja kierowcy
- WebSocket: `driver_location` event

### 9. Monitoring
- Prometheus metrics: `prom-client`
- Grafana dashboards
- Sentry: error tracking

### 10. Testy
- Unit tests: Jest dla services
- E2E: Playwright dla frontendów
- Load tests: k6 dla API

## 📝 Notatki techniczne dla AI

### Docker
- Wszystko używa nazw serwisów: `api:4000`, `postgres:5432`, `redis:6379`
- NIE używaj `localhost` w kontenerach
- WebSocket przez Nginx: `wss://ws.domena.pl` → proxy do `api:4001`

### Prisma
- Po zmianie schema: `pnpm --filter api db:generate`
- Po zmianie modeli: `pnpm --filter api db:migrate`
- Seed: `pnpm --filter api db:seed`

### Redis
- Cache: `redis.setex(key, 300, JSON.stringify(data))`
- Pub/sub: `redis.publish('orders:new', JSON.stringify(order))`
- Socket.io adapter: `createAdapter(redisClient, redisPubClient)`

### WebSocket
- Client: `new WebSocket(wsUrl)` lub `socket.io-client`
- Server: `@nestjs/websockets` + `socket.io`
- Rooms: `order:${id}`, `kitchen`, `driver:${id}`

### Auth
- JWT w HttpOnly cookie (nie localStorage)
- Refresh token rotacja
- RBAC: `@Roles('admin')` + `RolesGuard`

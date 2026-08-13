# 🤖 HANDOFF — Stan projektu WebowoROS

> Ten plik czyta TYLKO AI. Zwięźle, bez marketingu.

## Co zrobione (Etap 0-4 częściowo)

### ✅ Etap 0: Infrastruktura
- Monorepo Turborepo + pnpm workspaces
- Docker: 4 Dockerfile'y (multi-stage, Alpine, standalone)
- 3 docker-compose: dev, prod, swarm (multi-host)
- Nginx: reverse proxy, SSL, WS proxy, rate limiting
- Health checks: API, PostgreSQL, Redis
- Env files: wszystkie aplikacje z Docker service names

### ✅ Etap 1: Design System
- Tokens: kolory, typografia, spacing, animacje
- shadcn/ui: Button, Card, Input, Badge, Dialog, Tabs, Toast
- Custom: PizzaBag, PizzaBuilder, ProductCard, FlyToBag, UpsellModal, BundleBuilder, AddonConfigurator, CheckoutTimeline, FreeDeliveryProgress, LastMinuteAddons

### ✅ Etap 2: Backend Core
- Prisma: 17 modeli, 11 enumów, indeksy, relacje
- NestJS: Auth (JWT+refresh), RBAC (5 ról), CRUD, Redis cache, WebSocket, Zod validation
- Endpoints: /auth, /menu, /products, /orders, /admin/*, /health
- Testy E2E: auth, menu, orders
- **Naprawione błędy:** parseInt('7d'), paymentMethod as any, tip Decimal, KEYS → SCAN

### 🟡 Etap 3: Frontend Web (w trakcie)
- **Gotowe:** layout, page, menu, bag, checkout (refactored na moduły), track
- **Integracja z API:** useMenu, useProduct, useOrder, useCreateOrder hooks
- **Cart context:** localStorage, dodawanie, usuwanie, ilość
- **Checkout:** 3 kroki, Zod + React Hook Form, walidacja adresu
- **Track:** timeline 7 statusów, WebSocket + fallback polling
- **Brakuje:** PWA service worker, offline mode, push notifications

### 🟡 Etap 4: Panel Admina (w trakcie)
- **Gotowe:** login, layout z sidebarem, home (stats + recent orders), KDS (kanban)
- **Integracja:** dashApi, AuthContext, useOrders, useStats hooks
- **Brakuje:** /orders (lista z filtrami), /products (CRUD), auth guard (middleware)

### ⚪ Etap 5-8: Nie rozpoczęte
- Etap 5: Dostawy + KDS (dla kierowców)
- Etap 6: Drukarki (stub — tylko console.log)
- Etap 7: Płatności (Stripe/PayU)
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

**Zasada:** Kontenery używają nazw serwisów (`api:4000`, `postgres:5432`), NIE `localhost`.

## Pliki > 300 linii (do podziału w przyszłości)

| Plik | Linie | Status |
|------|-------|--------|
| `apps/api/prisma/seed.ts` | 414 | Seed — jednorazowy, OK |
| `docs/ui-ux.md` | 529 | Dokumentacja, OK |
| `docs/api.md` | 450 | Dokumentacja, OK |
| `docs/malina-start.md` | 398 | Dokumentacja, OK |
| `apps/api/prisma/schema.prisma` | 354 | Schema Prisma, OK |
| `apps/web/app/checkout/page.tsx` | ~120 | **Refactored** ✅ |

## Znane braki / TODO

1. **Dashboard /orders** — lista zamówień z filtrami, paginacją, akcjami
2. **Dashboard /products** — CRUD produktów (grid, search, toggle, edycja)
3. **Dashboard auth guard** — middleware przekierowujące niezalogowanych
4. **Printer service** — stub, wymaga node-escpos
5. **Payments** — brak integracji Stripe/PayU
6. **PWA** — service worker, manifest, offline mode
7. **Push notifications** — Web Push API
8. **Real-time map** — śledzenie kierowcy (Etap 5)
9. **Redis adapter** dla Socket.io (multi-instance API)
10. **Monitoring** — Prometheus, Grafana, Sentry

## Komendy szybkiego startu

```bash
# Dev (lokalnie)
cd infra/docker && docker-compose up -d

# Prod (single host)
cd infra/docker && docker-compose -f docker-compose.prod.yml up -d

# Swarm (multi-host)
cd infra/docker && docker stack deploy -c docker-compose.swarm.yml weboworos
```

## Struktura plików handoff

```
docs/
  handoff-current.md   ← TEN PLIK (stan obecny)
  handoff-next.md      ← Co kolejna AI ma zrobić
  handoff-arch.md      ← Architektura dla AI
```

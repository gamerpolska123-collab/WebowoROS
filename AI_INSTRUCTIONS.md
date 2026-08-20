# WebowoROS — Knowledge Base for AI Assistants
# ============================================
# Restaurant Order System | Next AI Context Document
# Last updated: 2026-08-20
# Author: Previous AI session
# Purpose: Preserve all fixes, rules, and architecture knowledge for seamless continuation

## 1. PROJECT OVERVIEW

WebowoROS is a restaurant online ordering system (pizza, burgers, etc.) running on a Raspberry Pi in a local network (IP: 192.168.1.28).

### Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js Web   │     │  Next.js Dash   │     │   NestJS API    │
│   Port 3000     │◄────┤   Port 3001     │◄────┤   Port 4000     │
│  (Customer UI)  │     │   (Admin Panel) │     │  (Backend API)  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │      Docker Compose      │
                    │  PostgreSQL (port 5432)  │
                    │  Redis (port 6379)       │
                    │  WebSocket (port 4001)   │
                    └──────────────────────────┘
```

### Tech Stack
- **Backend:** NestJS 10, Prisma ORM, PostgreSQL 16, Redis 7, Socket.io WebSocket
- **Frontend Web:** Next.js 14 App Router, Tailwind CSS, TanStack Query, Axios
- **Frontend Dashboard:** Next.js 14 App Router, same stack
- **Shared:** `packages/ui` (shared React components), `packages/shared-types` (TypeScript types)
- **Infra:** Docker Compose, Prometheus metrics, Swagger docs
- **Deployment:** Raspberry Pi 4/5, LAN access via http://192.168.1.28:3000

## 2. CRITICAL RULES — NEVER BREAK THESE

### Rule 1: NO `app.get('/health')` in NestJS `main.ts`
The NestJS `app` object is NOT an Express app. Adding `app.get()` causes TypeScript compilation error:
```
error TS2769: No overload matches this call.
```
The health endpoint is already mapped in `HealthController` at `/v1/health`.

### Rule 2: ALWAYS guard `.toFixed()`, `.length`, array access
Every `.toFixed()` call MUST have a null guard:
```tsx
// WRONG — crashes if value is undefined
{value.toFixed(2)}

// CORRECT
{(value ?? 0).toFixed(2)}
```

Every `.length` access MUST have optional chaining:
```tsx
// WRONG
items.length

// CORRECT
(items?.length ?? 0)
```

### Rule 3: NEVER use `localhost` in frontend API URLs
The frontend runs in the user's browser, which is NOT the Raspberry Pi. `localhost` in the browser means the user's laptop, not the Docker container.

```tsx
// WRONG — fails from laptop in LAN
const API_URL = 'http://localhost:4000/v1'

// CORRECT — relative path via Next.js proxy
const API_URL = '/api/v1'
```

The proxy is configured in `next.config.js`:
```js
async rewrites() {
  return [{ source: '/api/v1/:path*', destination: 'http://ros-api:4000/v1/:path*' }];
}
```

### Rule 4: ALWAYS check `typeof window !== 'undefined'` before `window`/`document`
Next.js App Router pre-renders on the server where `window` and `document` do not exist.

```tsx
// WRONG — SSR crash
window.location.hostname

// CORRECT
if (typeof window !== 'undefined') {
  const host = window.location.hostname;
}
```

### Rule 5: `@Public()` decorator for public endpoints
The `JwtAuthGuard` is registered globally as `APP_GUARD`. Every controller/endpoint that should be accessible without authentication MUST have `@Public()` decorator.

```ts
@Public()
@Controller('menu')
export class MenuController { ... }
```

Currently public:
- `HealthController`
- `MenuController`
- `MetricsController`
- `AuthController` methods: `csrf`, `register`, `login`, `refresh`
- `OrdersController.createOrder` (guest checkout)

### Rule 6: WebSocket URL must be dynamic
```ts
export function getWebSocketUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname; // auto-detects LAN IP
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${host}:4001`;
  }
  return 'ws://192.168.1.28:4001';
}
```

## 3. WHAT HAS ALREADY BEEN FIXED

### Frontend (Web + Dashboard)
- [x] `pizza-bag.tsx` — completely rewritten with bulletproof null/NaN guards
- [x] `login/page.tsx` — removed crash-prone PizzaBag from login header (replaced with safe SVG link)
- [x] `bag/page.tsx` — removed PizzaBag, added guards
- [x] `page.tsx` (home) — `subtotal ?? 0`, product variant/addon guards
- [x] `menu/page.tsx` — same guards as home
- [x] `checkout/*.tsx` — 6x `.toFixed()` guards, localStorage try-catch
- [x] `track/[orderId]/page.tsx` — `totalPrice` guard, `document.cookie` guard, `'use client'`
- [x] `offline/page.tsx` — `window` guard
- [x] `sales-report.tsx` — 6x `.toFixed()` guards
- [x] `addon-configurator.tsx` — 2x `.toFixed()` guards
- [x] `bundle-builder.tsx` — 3x `.toFixed()` + `.length` guards
- [x] `last-minute-addons.tsx` — 1x `.toFixed()` guard
- [x] `pizza-builder.tsx` — 1x `.toFixed()` + variant/addon guards
- [x] `product-card.tsx` — 1x `.toFixed()` + variant guards
- [x] `upsell-modal.tsx` — 1x `.toFixed()` guard
- [x] `checkout-timeline.tsx` — `steps.length` guard
- [x] `api.ts` (web) — relative `/api/v1`, dynamic WebSocket, network error handling
- [x] `api.ts` (dashboard) — relative `/api/v1`
- [x] `auth-context.tsx` — graceful degradation on network errors, no crash on 401
- [x] `cart-context.tsx` — safe localStorage, API unreachable handling
- [x] `hooks.ts` — `fetchWithRetry` with connection error handling
- [x] `error.tsx` — safe logging without triggering React render loops

### Dashboard
- [x] `kds/page.tsx` — 4x `.length` guards
- [x] `orders-table.tsx` — `orders.length` guard
- [x] `products/page.tsx` — `filtered.length` guard
- [x] `product-card.tsx` — `tags.length` guard
- [x] `sortable-category-list.tsx` — `categories.length` guard

### Backend (API)
- [x] `public.decorator.ts` — created `@Public()` decorator
- [x] `jwt-auth.guard.ts` — skips JWT check for `@Public()` endpoints
- [x] `health.controller.ts` — `@Public()` added
- [x] `auth.controller.ts` — `@Public()` on csrf/register/login/refresh
- [x] `menu.controller.ts` — `@Public()` added
- [x] `orders.controller.ts` — `@Public()` on `createOrder`
- [x] `metrics.controller.ts` — `@Public()` added
- [x] `menu/service.ts` — `JSON.parse` wrapped in try-catch
- [x] `orders/service.ts` — `items.length` guard
- [x] `admin/service.ts` — `results.length` guard
- [x] `main.ts` — removed broken `app.get('/health')`, CSP uses env CORS_ORIGINS

### Infrastructure
- [x] `docker-compose.yml` — LAN IP hardcoded (192.168.1.28), healthcheck on `/v1/health`
- [x] `web/next.config.js` — proxy rewrites `/api/v1/*` → `ros-api:4000/v1/*`
- [x] `dashboard/next.config.js` — same proxy rewrites
- [x] `webowo.sh` — unified advanced management script (install/start/stop/logs/db/test/health/network)

## 4. KNOWN ISSUES STILL TO FIX

### Issue A: Page refreshes in a loop on /login
**Symptom:** Browser constantly refreshes, shows login page, then refreshes again. Cannot navigate to home page.

**Likely causes to investigate:**
1. `middleware.ts` — may be redirecting authenticated users to /login or unauthenticated users in a loop
2. `auth-context.tsx` — `useEffect` checking `/auth/me` may trigger re-render loop when API returns 401
3. `error.tsx` — may call `console.error` during render which triggers React Dev Overlay re-render loop
4. `PizzaBag` component — may still crash on some page if not fully removed from all headers
5. `page.tsx` (home) — may crash during render if `featuredProducts` is undefined

**How to debug:**
```bash
./webowo.sh logs web   # check Next.js logs
./webowo.sh logs api   # check if /auth/me is being called repeatedly
```

**What to check:**
- Open browser DevTools → Network tab → look for repeated requests to `/api/v1/auth/me`
- Check Console for any crash errors (red stack traces)
- Check if `middleware.ts` has logic like: `if (!token) redirect('/login')` which runs on EVERY request including /login itself

### Issue B: ERR_CONNECTION_REFUSED on /v1/auth/me and /v1/menu
**Symptom:** Browser shows `net::ERR_CONNECTION_REFUSED` for API calls.

**Likely causes:**
1. API container not running — check `docker ps`
2. Proxy not working — Next.js rewrite may not forward correctly
3. CORS blocking — API may reject requests from 192.168.1.28:3000
4. API crashed during startup — check `docker logs ros-api`

**How to debug:**
```bash
curl http://192.168.1.28:4000/v1/health    # test API directly
curl http://192.168.1.28:3000/api/v1/health  # test via proxy
```

### Issue C: 401 Unauthorized on public endpoints
**Symptom:** `/v1/menu` or `/v1/health` returns 401 "Access token missing".

**Likely cause:** `JwtAuthGuard` is not properly detecting `@Public()` decorator.

**How to debug:**
- Check `jwt-auth.guard.ts` — ensure `Reflector` is injected and `getAllAndOverride` is correct
- Check that `Public` decorator file exists at `apps/api/src/common/decorators/public.decorator.ts`
- Check that `APP_GUARD` in `app.module.ts` is configured correctly

### Issue D: Prisma migrations missing on first run
**Symptom:** API starts but database tables don't exist, causing 500 errors.

**Fix:**
```bash
./webowo.sh db migrate
./webowo.sh db seed
```

### Issue E: CSRF token not sent correctly
**Symptom:** POST requests (login, register, create order) return 403 "CSRF token missing".

**How to check:**
- Frontend `api.ts` interceptor reads `csrf_token` from `document.cookie`
- Must send as header `X-CSRF-Token`
- The cookie must be `SameSite=None; Secure` for cross-origin, but in LAN it may need `SameSite=Lax`

## 5. HOW TO TEST

### Quick health check
```bash
./webowo.sh health
```

### Manual testing from laptop in LAN
1. Open http://192.168.1.28:3000 — should show home page with menu
2. Open http://192.168.1.28:3001 — should show dashboard login
3. Open http://192.168.1.28:4000/v1/health — should return JSON `{ status: "ok" }`
4. Open http://192.168.1.28:4000/v1/menu — should return menu JSON (no 401)

### Browser DevTools checks
- Network tab: look for repeated /auth/me calls (indicates loop)
- Console tab: look for red crash errors
- Application → Cookies: check if `access_token` and `csrf_token` cookies exist

## 6. FILE STRUCTURE REFERENCE

```
WebowoROS/
├── apps/
│   ├── api/                 # NestJS backend
│   │   src/
│   │   ├── main.ts          # Entry point (NO app.get()!)
│   │   ├── app.module.ts    # APP_GUARD config
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   │   └── public.decorator.ts   # @Public() — must exist
│   │   │   ├── guards/
│   │   │   │   └── jwt-auth.guard.ts     # Checks @Public()
│   │   ├── auth/
│   │   ├── menu/
│   │   ├── orders/
│   │   ├── health/
│   │   └── ...
│   ├── web/                 # Next.js customer storefront
│   │   app/
│   │   │   ├── page.tsx     # Home page
│   │   │   ├── menu/page.tsx
│   │   │   ├── bag/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── checkout/
│   │   │   ├── track/
│   │   │   ├── error.tsx    # Must not call setState during render
│   │   │   └── layout.tsx
│   │   lib/
│   │   │   ├── api.ts       # MUST use /api/v1 (relative)
│   │   │   ├── auth-context.tsx
│   │   │   ├── cart-context.tsx
│   │   │   └── hooks.ts
│   │   next.config.js       # MUST have /api/v1 proxy rewrites
│   │   middleware.ts        # Check for redirect loops!
│   └── dashboard/           # Next.js admin panel
│       app/
│       lib/
│       └── next.config.js
├── packages/
│   ├── ui/                  # Shared React components
│   │   src/components/
│   │   │   ├── pizza-bag.tsx
│   │   │   ├── product-card.tsx
│   │   │   ├── pizza-builder.tsx
│   │   │   └── ...
│   └── shared-types/        # TypeScript types
├── infra/docker/
│   └── docker-compose.yml   # LAN IP, healthchecks, CORS
└── webowo.sh                # Unified management script
```

## 7. ENVIRONMENT VARIABLES

Key variables in `.env`:
```
NODE_ENV=development
DATABASE_URL=postgresql://ros_user:ros_pass@db:5432/restaurant_db
REDIS_URL=redis://redis:6379
JWT_SECRET=<random-hex-64-chars>
API_PORT=4000
WS_PORT=4001
WEB_PORT=3000
DASHBOARD_PORT=3001
NEXT_PUBLIC_API_URL=http://192.168.1.28:4000/v1
NEXT_PUBLIC_WS_URL=ws://192.168.1.28:4001
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://192.168.1.28:3000,http://192.168.1.28:3001
```

The `webowo.sh` script auto-detects LAN IP and updates `.env` if IP changed.

## 8. COMMON COMMANDS

```bash
./webowo.sh install     # First time setup
./webowo.sh start       # Start all services
./webowo.sh stop        # Stop all services
./webowo.sh restart     # Restart
./webowo.sh logs api    # View API logs
./webowo.sh logs web    # View web logs
./webowo.sh health      # Quick diagnostic
./webowo.sh db migrate  # Run Prisma migrations
./webowo.sh db seed     # Seed test data
./webowo.sh db backup   # Backup database
./webowo.sh clean       # DESTROY everything (data + images)
```

## 9. NOTES FOR NEXT AI

- The user runs this on Raspberry Pi in LAN. Test URLs must use 192.168.1.28, NOT localhost.
- The user does NOT want to see code in responses. Send only the fixed ZIP file.
- Always verify your changes compile before finishing. Check for TypeScript errors.
- When fixing a bug, check ALL files that might have the same pattern (e.g., if you fix `.toFixed()` in one file, search for all other `.toFixed()` occurrences).
- The `webowo.sh` script is the single source of truth for management. Do not create new scripts.
- If you add new files (like decorators), make sure they are included in the ZIP.
- Before declaring success, verify: home page loads, menu API returns 200, no infinite refresh loops.

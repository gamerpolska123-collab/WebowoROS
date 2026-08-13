# Setup — Instrukcja Instalacji

## 1. Wymagania

- **Node.js** 20+ (LTS)
- **pnpm** 8+ (zalecane) lub npm/yarn
- **Docker** + Docker Compose
- **Git**

---

## 2. Klonowanie repozytorium

```bash
git clone https://github.com/gamerpolska123-collab/WebowoROS
cd restaurant-order-system
```

---

## 3. Instalacja zależności

```bash
pnpm install
```

---

## 4. Konfiguracja środowiska

### 4.1 Plik .env

```bash
cp .env.example .env
```

Uzupełnij:
```env
# Baza danych
DATABASE_URL=postgresql://ros_user:ros_password@localhost:5432/restaurant_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Stripe (test)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayU (test)
PAYU_CLIENT_ID=...
PAYU_CLIENT_SECRET=...

# Drukarki
PRINTER_TYPE=escpos
PRINTER_INTERFACE=usb

# Aplikacja
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4001
```

### 4.2 Baza danych (Docker)

```bash
docker-compose -f infra/docker/docker-compose.yml up -d postgres redis
```

---

## 5. Migracje i seedery

```bash
cd apps/api
pnpm prisma migrate dev
pnpm prisma db seed
```

---

## 6. Uruchomienie (development)

```bash
# W root projektu
pnpm dev
```

To uruchomi wszystkie aplikacje równolegle (Turborepo):
- Web: http://localhost:3000
- Dashboard: http://localhost:3001
- API: http://localhost:4000
- WebSocket: http://localhost:4001

---

## 7. Uruchomienie pojedynczych aplikacji

```bash
# Tylko API
pnpm --filter api dev

# Tylko web
pnpm --filter web dev

# Tylko dashboard
pnpm --filter dashboard dev
```

---

## 8. Testy

```bash
# Wszystkie testy
pnpm test

# Tylko API
pnpm --filter api test

# Tylko web
pnpm --filter web test

# E2E (Playwright)
cd apps/web && pnpm test:e2e
```

---

## 9. Lint i formatowanie

```bash
pnpm lint
pnpm format
```

---

## 10. Produkcja (lokalny build)

```bash
pnpm build
```

Sprawdź czy buildy nie zawierają błędów.

---

*Setup v1.0 — 2026-08-12*

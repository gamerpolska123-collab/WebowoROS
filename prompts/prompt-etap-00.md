# PROMPT: ETAP 0 — Infrastruktura i Setup

Wykonaj ETAP 0 projektu Restaurant Order System.

## Cel
Stwórz kompletne środowisko deweloperskie: monorepo, konfigurację, Docker, CI.

## Zadania (wykonaj po kolei):

### Zadanie 1: Monorepo + pnpm workspaces
- Stwórz `package.json` root z `pnpm-workspace.yaml` (workspaces: apps/*, packages/*)
- Dodaj `turbo.json` z pipeline (build, dev, lint, test)
- Stwórz katalogi: `apps/`, `packages/`, `infra/docker/`, `infra/nginx/`

### Zadanie 2: Konfiguracja wspólna
- `packages/config/tsconfig.base.json` — strict TypeScript config
- `packages/config/eslint.config.js` — ESLint flat config (TypeScript + React)
- `packages/config/prettier.config.js` — Prettier config

### Zadanie 3: Inicjalizacja aplikacji
- `apps/api/` — NestJS (nest new api --strict)
- `apps/web/` — Next.js 14 App Router (create-next-app)
- `apps/dashboard/` — Next.js 14 App Router (create-next-app)
- `apps/printer-service/` — Node.js + TypeScript (package.json + tsconfig)
- `packages/shared-types/` — wspólne interfejsy (np. Product, Order, User)
- `packages/ui/` — shadcn/ui init + bazowe komponenty

### Zadanie 4: Docker Compose dev
- `infra/docker/docker-compose.yml` — PostgreSQL 16 + Redis 7
- `infra/docker/Dockerfile.api` — multi-stage NestJS
- `infra/docker/Dockerfile.web` — multi-stage Next.js standalone
- `infra/docker/Dockerfile.dashboard` — multi-stage Next.js standalone
- `infra/docker/Dockerfile.printer` — Node.js + escpos

### Zadanie 5: GitHub Actions CI
- `.github/workflows/ci.yml` — lint + typecheck + build na PR
- `.github/workflows/deploy-staging.yml` — deploy na Raspberry Pi (manualny trigger)

### Zadanie 6: Env files
- `apps/api/.env.example` — DATABASE_URL, REDIS_URL, JWT_SECRET
- `apps/web/.env.example` — NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL
- `apps/dashboard/.env.example` — jak wyżej

## Po zakończeniu:
ZAPISZ STAN PRACY w README-AI.md:
- Zmień "Etap 0 — Kod: Nie rozpoczęty" → "Etap 0 — Kod: Zakończony"
- Wypisz utworzone pliki i katalogi
- Zanotuj problemy / decyzje do podjęcia

Nie przechodź do Etapu 1 bez mojej zgody.
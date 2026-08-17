# 🤖 README-AI.md
## Instrukcja dla Asystenta AI

---

## 1. KONTEXT PROJEKTU

**Nazwa:** Restaurant Order System (ROS)  
**Cel:** System zamówień online dla pizzerii z zaawansowanym upsellem, torba dostawcza zamiast koszyka, gamifikacja (confetti, progress bar), KDS, drukarki termiczne (bilety wewnętrzne — nie paragony fiskalne), dashboard admina, płatności Stripe/PayU, deployment na Raspberry Pi 4.

**Stack:** Next.js 14 (App Router) + NestJS + PostgreSQL 16 + Redis 7 + Socket.io + Prisma + Tailwind + shadcn/ui + Turborepo + npm workspaces + Docker.

---

## 2. ARCHITEKTURA SYSTEMU

### Monorepo (Turborepo)
```
restaurant-order-system/
├── apps/
│   ├── api/              # NestJS + Prisma (backend)
│   ├── web/              # Next.js 14 (strona klienta)
│   ├── dashboard/        # Next.js 14 (panel admina)
│   └── printer-service/  # Node.js + Redis (drukarki ESC/POS)
├── packages/
│   ├── shared-types/     # TypeScript types (Product, Order, etc.)
│   ├── ui/               # shadcn/ui + custom components
│   └── config/           # tsconfig, eslint, prettier
├── infra/
│   ├── docker/           # Dockerfiles + docker-compose
│   └── nginx/            # Reverse proxy config
└── .github/workflows/    # CI/CD
```

### Baza Danych (PostgreSQL 16)
- **Users** (role: guest, customer, kitchen, driver, admin)
- **Categories** (hierarchia kategorii)
- **Products** (z wariantami, addonami, allergenami)
- **Orders** (z historią statusów)
- **OrderItems** (z addonami)
- **Payments** (Stripe/PayU integracja)
- **SiteConfig** (kolory, animacje, dźwięki)

### Komunikacja Real-time (Socket.io)
- **Room:** `order:{orderId}` — aktualizacje statusu zamówienia
- **Room:** `kitchen` — nowe zamówienia dla KDS
- **Room:** `driver:{driverId}` — przypisane dostawy

---

## 3. ZASADY KODOWANIA (MUSI BYĆ PRZESTRZEGANE)

### Język
- **Kod, zmienne, komentarze, nazwy plików:** ANGIELSKI
- **Dokumentacja użytkownika (UI, etykiety):** POLSKI
- **Commity:** Conventional Commits po angielsku

### TypeScript
- Strict mode włączony
- Brak `any` — używaj `unknown` + type guards
- Wszystkie funkcje muszą mieć zdefiniowane return types
- Interfejsy w `packages/shared-types`

### Style
- Tailwind CSS — utility-first
- shadcn/ui jako baza komponentów
- Kolory zdefiniowane w `tailwind.config.ts` (primary, secondary, accent, dark, light, gold, danger)
- Animacje w `packages/ui/src/styles/animations.css`

### Bezpieczeństwo
- JWT w HttpOnly cookies (nie localStorage!)
- Walidacja Zod na wszystkich endpointach
- Rate limiting (10 req/s per IP)
- SQL injection impossible (Prisma ORM)
- XSS protection (React auto-escaping + CSP headers)
- Nie commituj `.env`!

---

## 4. STAN PROJEKTU

✅ Dokumentacja: Kompletna w folderze docs/  
✅ Etap 0 — Infrastruktura i Setup: Zakończony (monorepo, Docker, CI/CD, env)  
✅ Etap 1 — Design System i Prototypy UX: Zakończony (tokens, shadcn/ui, custom components, animacje, prototypy web+dashboard)  
✅ Etap 2 — Backend Core: Zakończony (Prisma schema, NestJS auth, CRUD API, Redis cache, WebSocket, testy E2E)  
❌ Etap 3 — Frontend Web: Nie rozpoczęty  
❌ Etap 4 — Panel Administracyjny: Nie rozpoczęty  
❌ Etap 5 — System Dostaw i KDS: Nie rozpoczęty  
❌ Etap 6 — Drukarki i Fiskalność: Nie rozpoczęty  
❌ Etap 7 — Płatności Online: Nie rozpoczęty  
❌ Etap 8 — Optymalizacja i Deployment: Nie rozpoczęty  

**Aktualny status:** Etap 2 zakończony. Gotowe do implementacji Frontend Web (Etap 3).

---

## 5. ETAPY IMPLEMENTACJI

| Etap | Nazwa | Status |
|------|-------|--------|
| 0 | Infrastruktura i Setup | ✅ Zakończony |
| 1 | Design System i Prototypy UX | ✅ Zakończony |
| 2 | Backend Core | ✅ Zakończony |
| 3 | Frontend Web | ❌ Nie rozpoczęty |
| 4 | Panel Administracyjny | ❌ Nie rozpoczęty |
| 5 | System Dostaw i KDS | ❌ Nie rozpoczęty |
| 6 | Drukarki i Fiskalność | ❌ Nie rozpoczęty |
| 7 | Płatności Online | ❌ Nie rozpoczęty |
| 8 | Optymalizacja i Deployment | ❌ Nie rozpoczęty |

---

## 6. KONFIGURACJA ŚRODOWISKA

### Wymagania
- Node.js >= 20.0.0
- npm >= 9.0.0
- Docker + Docker Compose

### Pierwsze uruchomienie
```bash
# 1. Instalacja zależności
npm install

# 2. Baza danych i Redis
docker-compose -f infra/docker/docker-compose.yml up -d postgres redis

# 3. Kopiowanie env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/dashboard/.env.example apps/dashboard/.env

# 4. Generowanie Prisma Client
npm --filter api db:generate

# 5. Migracje
npm --filter api migrate:dev

# 6. Seed danych
npm --filter api db:seed

# 7. Dev mode (wszystkie aplikacje)
npm dev
```

### Porty
- Web: http://localhost:3000
- Dashboard: http://localhost:3001
- API: http://localhost:4000
- WebSocket: ws://localhost:4001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Testy
```bash
# E2E tests
npm --filter api test:e2e

# Unit tests
npm --filter api test
```

---

## 7. WORKFLOW GITA

### Branching
- `main` — produkcja (Raspberry Pi)
- `develop` — staging
- `feature/etap-X-nazwa` — funkcjonalności
- `hotfix/nazwa` — krytyczne poprawki

### Commity
```
feat(api): add JWT authentication
fix(web): resolve hydration error in ProductCard
docs: update API documentation
refactor(dashboard): extract OrderTable component
```

### PR Checklist
- [ ] Testy przechodzą (`npm test`)
- [ ] TypeScript strict (`npm typecheck`)
- [ ] ESLint clean (`npm lint`)
- [ ] Build success (`npm build`)
- [ ] Prisma migrate deploy (jeśli zmiana schematu)

---

## 8. CHECKLISTY KONTROLNE

### Przed każdym commitem
- [ ] `npm lint` — 0 błędów
- [ ] `npm typecheck` — 0 błędów
- [ ] `npm test` — wszystkie przechodzą
- [ ] Brak `console.log` w kodzie produkcyjnym
- [ ] `.env` nie jest commitowany
- [ ] Zmiany w schemacie Prisma mają migrację

### Przed deployem
- [ ] `npm build` — success
- [ ] Docker images buildują się lokalnie
- [ ] Prisma migrate deploy przetestowany
- [ ] Environment variables ustawione na serwerze
- [ ] SSL certyfikaty skonfigurowane
- [ ] Backup bazy danych

---

## 9. INSTRUKCJA DLA AI

### Jak pracować z tym projektem
1. **Przeczytaj wszystkie pliki** w folderze `docs/` i `prompts/` przed rozpoczęciem pracy
2. **Pracuj etapami** — nie przeskakuj kolejności
3. **Testuj lokalnie** — uruchom `npm dev` i sprawdź w przeglądarce
4. **Commituj często** — każda funkcjonalność = osobny commit
5. **Dokumentuj zmiany** — aktualizuj README-AI.md i docs/etapy.md

### Jak zgłaszać problemy
- Jeśli napotkasz błąd, opisz go szczegółowo (krok po kroku)
- Dołącz logi z konsoli
- Wskaż plik i linię kodu

### Jak prosić o zmiany
- Bądź konkretny ("zmień kolor primary na #E63946")
- Podaj kontekst ("w kontekście strony głównej")
- Wskaż plik jeśli wiesz gdzie

---

## 10. KONTAKT I WSPARCIE

**Właściciel repozytorium:** gamerpolska123-collab  
**Projekt:** WebowoROS  
**Licencja:** MIT (patrz docs/licencje.md)

---

*Ostatnia aktualizacja: 13.08.2026 — Etap 2 zakończony*


## Etap 3 — Implementacja Frontend Web (2026-08-17)

### Zaimplementowane komponenty

**Core Infrastructure:**
- `lib/api.ts` — Axios instance z interceptors (CSRF, 401 refresh, WebSocket URL)
- `lib/query-client.ts` — TanStack Query client
- `lib/auth-context.tsx` — Auth state (login, register, logout, /auth/me)
- `lib/cart-context.tsx` — Cart (localStorage persistence, API sync, quantity management)
- `lib/hooks.ts` — 10 React Query hooks

**Strony:**
- `app/page.tsx` — Strona główna (ISR-ready, real API data, skeleton loading)
- `app/login/page.tsx` — Logowanie + rejestracja (toggle, validation, redirect)
- `app/menu/page.tsx` — Pełne menu (category filter, product grid)
- `app/bag/page.tsx` — Torba (items, quantity, FreeDeliveryProgress, summary)
- `app/checkout/page.tsx` — 3-krokowy wizard (dane dostawy, płatność, podsumowanie)
- `app/track/page.tsx` — Lista zamówień (auth guard, status labels)
- `app/track/[orderId]/page.tsx` — Szczegóły zamówienia (timeline, WebSocket, cancel)
- `app/privacy/page.tsx` — Polityka prywatności (RODO)
- `app/terms/page.tsx` — Regulamin
- `app/offline/page.tsx` — Strona offline (PWA)

**PWA:**
- `public/sw.js` — Service Worker (cache strategies, background sync)
- `public/manifest.json` — PWA manifest

**Testy:**
- `__tests__/api.test.ts` — API client tests
- `__tests__/cart-context.test.tsx` — 6 cart tests
- `__tests__/auth-context.test.tsx` — 5 auth tests
- `__tests__/hooks.test.ts` — 6 hook tests
- `__tests__/checkout-integration.test.tsx` — Integration placeholder

### Walidacja formularzy
- Telefon: format +48 123 456 789
- Email: standardowy regex
- Kod pocztowy: format 00-000
- Imię/Nazwisko: min. 2 znaki
- Regulamin: wymagany checkbox

### Bezpieczeństwo
- IdempotencyKey (UUID v4) przy tworzeniu zamówienia
- CSRF token w nagłówkach
- HttpOnly cookies dla JWT
- Walidacja uploadu (5MB, MIME, magic bytes)
- Rate limiting na auth (5/min login, 3/min register)

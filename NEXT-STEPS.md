# 📋 NASTĘPNE KROKI — WebowoROS
## Dokument przejęcia pracy dla następnej sesji AI

**Data:** 2026-08-17  
**Wykonane w tej sesji:** Pełny audyt + naprawa krytycznych błędów  
**Pozostałe do zrobienia:** Implementacja etapów 3-8

---

## ✅ CO ZOSTAŁO NAPRAWIONE W TEJ SESJI

### Krytyczne (CRITICAL)
| # | Problem | Fix | Plik |
|---|---------|-----|------|
| C1 | Pliki `.env` w repozytorium | Usunięte + zaktualizowany `.gitignore` | root, apps/*/.env |
| C2 | Brak root `package.json` | Utworzony z workspaces | `/package.json` |
| C2a | Brak `pnpm-workspace.yaml` | Utworzony | `/pnpm-workspace.yaml` |
| H3 | Brak auth w WebSocket | Dodano JWT verify w `handleConnection` | `orders.gateway.ts` |
| H4 | Middleware dashboard — hardcoded secret | Usunięto fallback, dodano role-based paths | `middleware.ts` |
| H5 | Wyłączony strict mode w API | Włączono `strictNullChecks`, `noImplicitAny`, `strictBindCallApply` | `tsconfig.json` |
| M1 | Broken import `webApi` | Zmieniono na `api` | `use-create-order.ts` |
| M6 | Brak CORS | Dodano `app.enableCors()` w `main.ts` | `main.ts` |
| M7 | Brak walidacji uploadu | Dodano max size (5MB), MIME type, extension, magic bytes | `upload.service.ts` |
| M8 | Brak rate limit na auth | Dodano `@Throttle(5, 60)` na login, `@Throttle(3, 60)` na register | `auth.controller.ts` |
| M9 | Brak idempotencyKey w API | Dodano do DTO (opcjonalne) | `order.dto.ts` |
| L1 | Brak `loading.tsx` | Dodano do web i dashboard | `app/loading.tsx` |
| L2 | Brak `not-found.tsx` | Dodano do web | `app/not-found.tsx` |
| L4 | Brak `robots.txt`, `sitemap.xml` | Dodano | `public/` |
| L6 | Brak `lucide-react` w web | Dodano do `package.json` | `package.json` |

---

## 🎯 CO TRZEBA ZROBIĆ — PRIORYTETOWA LISTA

### PRIORYTET 1: Infrastruktura i Bezpieczeństwo (1 sesja)
- [ ] **Regeneracja sekretów** — wszystkie klucze z `.env` muszą zostać zmienione (JWT_SECRET, DB password, Stripe keys, PayU keys)
- [ ] **Wyczyścić historię gita** — użyć `git filter-branch` lub BFG Repo-Cleaner do usunięcia `.env` z historii
- [ ] **Dodać `package-lock.json`** — `npm install` w root, commit `package-lock.json`
- [ ] **Przetestować build Docker** — `docker-compose -f infra/docker/docker-compose.yml up --build`
- [ ] **Dodać `db:generate` do root scripts** — sprawdzić czy Prisma generate działa w kontekście workspace

### ✅ PRIORYTET 2: Etap 3 — Frontend Web (ZAKOŃCZONY)

**Status:** ✅ ZAKOŃCZONY — wszystkie strony zaimplementowane, testy dodane, PWA gotowe.

**Zaimplementowano:**
- Strona główna (ISR, real API data, skeleton loading)
- Menu (category filter, product grid)
- Torba (localStorage + API sync, quantity management)
- Checkout (3-krokowy wizard, walidacja Zod, idempotencyKey)
- Śledzenie zamówień (lista + szczegóły z WebSocket)
- Logowanie/rejestracja (toggle, validation)
- Polityka prywatności + Regulamin (RODO)
- PWA (Service Worker, offline page, manifest)
- Testy: API, Cart, Auth, Hooks (17 testów)

**Pozostałe do zrobienia w przyszłości:**
- Stripe Elements integration (wymaga kluczy testowych)
- PayU BLIK integration (wymaga konta PayU)
- Playwright E2E tests (Etap 8)
- Lighthouse audit optimization (Etap 8)

### PRIORYTET 3: Etap 4 — Dashboard Admin (2-3 sesje)
**Cel:** Pełny CRUD + raporty + SiteConfig.

#### Sesja 3A: Produkty i Kategorie
- [ ] `products/page.tsx` — full CRUD (create, update, delete)
- [ ] Upload zdjęć produktów (via API upload endpoint)
- [ ] `categories/page.tsx` — drag & drop reorder (dnd-kit)
- [ ] Inline price editor (PATCH + WS broadcast)

#### Sesja 3B: Zamówienia + Raporty
- [ ] `orders/page.tsx` — full filters, pagination, bulk actions
- [ ] `OrderDetail` — pełne szczegóły z timeline
- [ ] `SalesReport` — Recharts, daily/weekly/monthly
- [ ] `AovReport`, `UpsellConversionReport`, `PeakHoursReport`
- [ ] Export CSV/Excel

#### Sesja 3C: SiteConfig + Ustawienia
- [ ] `SiteConfigPage` — wybór ikony (torba/koszyk), animacje, motyw, dźwięki
- [ ] Broadcast zmian przez WebSocket (strona klienta odświeża config)
- [ ] `settings/page.tsx` — godziny otwarcia, strefy dostawy, ceny dostawy

### PRIORYTET 4: Etap 5 — KDS + Drukarki (2 sesje)
**Cel:** Pełny KDS + Printer Service.

#### Sesja 4A: KDS
- [ ] `kds/page.tsx` — fullscreen Kanban board
- [ ] `KdsCard` — timer, grupowanie pozycji, dźwięk nowego zamówienia
- [ ] Drag & drop między kolumnami (dnd-kit)
- [ ] Bump — PATCH status + WS broadcast

#### Sesja 4B: Printer Service
- [ ] `apps/printer-service/src/index.ts` — pełna implementacja
- [ ] `PrinterQueue.ts` — BullMQ na Redis
- [ ] `EscposPrinter.ts` — node-escpos wrapper (USB + Ethernet)
- [ ] `templates/kitchen-ticket.ts` — bilet kuchenny
- [ ] `templates/driver-ticket.ts` — bilet kierowcy
- [ ] Retry logic: 3 próby z exponential backoff
- [ ] Dead Letter Queue dla nieudanych wydruków

### PRIORYTET 5: Etap 6 — Płatności (2 sesje)
**Cel:** Stripe + PayU + bezpieczeństwo.

#### Sesja 5A: Stripe
- [ ] `stripe.service.ts` — Stripe SDK
- [ ] `POST /payments/stripe/create-intent` — PaymentIntent
- [ ] `POST /payments/stripe/webhook` — obsługa webhooków
- [ ] Stripe Elements na froncie (iframe)
- [ ] 3D Secure dla nowych klientów

#### Sesja 5B: PayU + Cash + Security
- [ ] `payu.service.ts` — PayU REST API
- [ ] `POST /payments/payu/create-order` — BLIK support
- [ ] `POST /payments/payu/notify` — notyfikacje PayU
- [ ] Cash on delivery flow
- [ ] HTTPS + SSL (Let's Encrypt via certbot)
- [ ] Helmet + CSP headers
- [ ] RODO: `privacy/page.tsx`, `terms/page.tsx`, cookie banner
- [ ] `DELETE /me` — prawo do zapomnienia
- [ ] `GET /me/data-export` — eksport JSON

### PRIORYTET 6: Etap 7 — Deployment RPi (1 sesja)
- [ ] `infra/scripts/rpi-setup.sh` — setup RPi (Docker, zswap, GPU memory)
- [ ] `infra/scripts/rpi-optimize.sh` — wyłączenie niepotrzebnych usług
- [ ] Watchtower — auto-pull obrazów z GHCR
- [ ] Uptime Kuma — monitoring dostępności
- [ ] Log rotation (docker logs max-size, max-file)
- [ ] `docs/DEPLOY.md`, `docs/TROUBLESHOOTING.md`, `docs/BACKUP-RESTORE.md`

### PRIORYTET 7: Etap 8 — Testy i Optymalizacja (2 sesje)
- [ ] Testy jednostkowe: Jest + React Testing Library (web, dashboard)
- [ ] Testy E2E: Playwright (pełna ścieżka: menu → torba → checkout → płatność)
- [ ] Testy wydajnościowe: k6 / Artillery (50 zamówień/godzinę)
- [ ] Testy bezpieczeństwa: OWASP ZAP
- [ ] Lighthouse: cel 90+ we wszystkich kategoriach
- [ ] PWA audit (Chrome DevTools)
- [ ] SEO audit (Google Search Console)

---

## 🏗 ARCHITEKTURA — CO JEST GOTOWE

### Backend (100% etapu 2)
- ✅ Prisma schema (17 modeli)
- ✅ Migracje i seedery
- ✅ REST API (auth, menu, orders, admin, categories, products, payments)
- ✅ WebSocket Gateway (podstawowy, teraz z JWT auth)
- ✅ JWT + RBAC (5 ról)
- ✅ Rate limiting (Throttler)
- ✅ Zod validation
- ✅ Swagger/OpenAPI
- ✅ Testy E2E (3 pliki)

### Frontend Web (20% — prototypy UI)
- ✅ Design system (tokens, shadcn/ui, custom components)
- ✅ Prototypy stron (page.tsx dla każdej routy)
- ✅ Animacje CSS (fly-to-bag, confetti, shake)
- ⚠️ Brak integracji z real API (mock data)
- ⚠️ Brak testów

### Dashboard (40% — podstawowe CRUD)
- ✅ Layout + AuthGuard
- ✅ KDS (Kanban board)
- ✅ Lista zamówień (tabela, filtry)
- ✅ Produkty (grid, toggle)
- ⚠️ Brak full CRUD (create, update, delete)
- ⚠️ Brak raportów
- ⚠️ Brak SiteConfig

### Printer Service (0%)
- ❌ Stub only — wymaga pełnej implementacji

---

## 🔐 UWAGI BEZPIECZEŃSTWA

1. **Sekrety wyciekły** — wszystkie klucze z `.env` MUSZĄ zostać zmienione przed deploymentem
2. **WebSocket teraz wymaga JWT** — frontend musi wysyłać token w `auth` podczas connect
3. **Rate limiting na auth** — max 5 logowań/min, 3 rejestracje/min
4. **Upload walidowany** — max 5MB, tylko obrazki, magic bytes check
5. **CORS skonfigurowany** — wymaga ustawienia `CORS_ORIGIN` w `.env`

---

## 📁 WAŻNE PLIKI I ICH LOKALIZACJE

| Plik | Lokalizacja | Opis |
|------|-------------|------|
| Root package.json | `/package.json` | NOWY — workspaces config |
| Prisma schema | `apps/api/prisma/schema.prisma` | 17 modeli |
| API main | `apps/api/src/main.ts` | Teraz z CORS |
| Auth controller | `apps/api/src/auth/auth.controller.ts` | Teraz z @Throttle |
| Orders gateway | `apps/api/src/gateway/orders.gateway.ts` | Teraz z JWT auth |
| Upload service | `apps/api/src/upload/upload.service.ts` | Teraz z walidacją |
| Web page | `apps/web/app/page.tsx` | Prototyp — wymaga API integration |
| Web hooks | `apps/web/lib/hooks.ts` | Wymaga retry logic |
| Dashboard middleware | `apps/dashboard/middleware.ts` | Teraz z role-based paths |
| Audit report | `AUDYT.md` | Pełny raport |

---

*Ten dokument został wygenerowany przez AI w sesji audytowej. Następna sesja AI powinna zacząć od PRIORYTETU 1 (infrastruktura) lub PRIORYTETU 2 (Etap 3 — Frontend Web), w zależności od priorytetów użytkownika.*

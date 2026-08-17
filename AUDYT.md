# 🔍 AUDYT KOMPLEKSOWY — WebowoROS
## Restaurant Order System — Pełny Raport Audytowy

**Data audytu:** 2026-08-17  
**Audytor:** AI Assistant  
**Zakres:** Całe repozytorium (kod, konfiguracja, dokumentacja, bezpieczeństwo, infrastruktura)  
**Metodologia:** Analiza statyczna, review architektoniczny, audyt bezpieczeństwa, weryfikacja spójności

---

## 📊 PODSUMOWANIE PROJEKTU

| Parametr | Wartość |
|----------|---------|
| **Nazwa** | WebowoROS (Restaurant Order System) |
| **Typ** | System zamówień online dla restauracji (pizzeria) |
| **Stack** | Next.js 14 + NestJS + PostgreSQL 16 + Redis 7 + Socket.io + Prisma + Tailwind + Docker |
| **Monorepo** | npm workspaces + Turborepo |
| **Aplikacje** | web (klient), dashboard (admin), api (backend), printer-service (drukarki) |
| **Pakiety** | shared-types, ui (shadcn/ui + custom), config (tsconfig/eslint/prettier) |
| **Łącznie linii kodu** | ~10,000+ (bez node_modules i .next) |
| **Pliki źródłowe** | 133+ |
| **Status dokumentacji** | Bardzo dobra (15 plików docs/) |
| **Status testów** | Tylko API E2E (3 pliki) — brak testów frontendu |

---

## 🎯 STATUS ETAPÓW (z README-AI.md)

| Etap | Nazwa | Status | Ocena jakości |
|------|-------|--------|---------------|
| 0 | Infrastruktura i Setup | ✅ Zakończony | Bardzo dobra |
| 1 | Design System i Prototypy UX | ✅ Zakończony | Bardzo dobra |
| 2 | Backend Core | ✅ Zakończony | Bardzo dobra |
| 3 | Frontend Web | ❌ Nie rozpoczęty | N/A |
| 4 | Panel Administracyjny | ❌ Nie rozpoczęty | N/A |
| 5 | System Dostaw i KDS | ❌ Nie rozpoczęty | N/A |
| 6 | Drukarki i Fiskalność | ❌ Nie rozpoczęty | N/A |
| 7 | Płatności Online | ❌ Nie rozpoczęty | N/A |
| 8 | Optymalizacja i Deployment | ❌ Nie rozpoczęty | N/A |

**Uwaga:** Frontend Web (Etap 3) jest oznaczony jako "nie rozpoczęty", ale w repo znajdują się prototypowe strony (page.tsx) w `apps/web/app/` oraz komponenty w `packages/ui/`. Oznacza to, że **Etap 1 (prototypy) zawiera kod UI, ale nie jest on podłączony do real API**.

---

## 🚨 ZNALEZIONE PROBLEMY

### 🔴 KRYTYCZNE (CRITICAL)

#### C1: Wyciek danych wrażliwych — pliki .env w repozytorium
- **Lokalizacja:** `/.env`, `/apps/api/.env`, `/apps/dashboard/.env`, `/apps/web/.env`
- **Ryzyko:** Wysokie — wyciek sekretów (JWT_SECRET, hasła DB, klucze API Stripe/PayU)
- **Opis:** Mimo że `.gitignore` zawiera `.env`, pliki te znajdują się w repo (prawdopodobnie dodane przed aktualizacją .gitignore lub force-push)
- **Działanie natychmiastowe:**
  1. Usunąć wszystkie pliki `.env` z repo (nie tylko z .gitignore)
  2. Wygenerować nowe sekrety (JWT_SECRET, hasła DB, klucze Stripe/PayU)
  3. Użyć `git filter-branch` lub `BFG Repo-Cleaner` do usunięcia z historii gita
  4. Dodać do `.gitignore` również `apps/*/.env` i `packages/*/.env`

#### C2: Brak root `package.json` — monorepo nie działa
- **Lokalizacja:** `/package.json` — BRAK
- **Ryzyko:** Krytyczne — projekt nie może być zbudowany jako monorepo
- **Opis:** Wszystkie Dockerfiles odwołują się do `COPY package.json package-lock.json ./`, ale root package.json nie istnieje. Oznacza to, że `npm install` na poziomie root nie zadziała, workspaces nie zostaną rozpoznane, a buildy Docker zawiodą.
- **Działanie natychmiastowe:**
  1. Utworzyć root `package.json` z definicją workspaces
  2. Utworzyć `package-lock.json` (lub przejść na pnpm z `pnpm-workspace.yaml`)
  3. Zaktualizować Dockerfiles jeśli używany jest pnpm

#### C3: Printer Service — pusty stub zamiast implementacji
- **Lokalizacja:** `apps/printer-service/src/index.ts`
- **Ryzyko:** Średnie — system drukowania nie działa
- **Opis:** Plik zawiera tylko placeholder `console.log("Printer service started")`. Brak implementacji kolejki Redis, obsługi ESC/POS, szablonów biletów.
- **Działanie:** Rozpisać implementację w osobnym dokumencie lub zlecić następnej sesji AI.

---

### 🟠 WYSOKIE (HIGH)

#### H1: Niespójność między Prisma schema a API DTO
- **Lokalizacja:** `apps/api/prisma/schema.prisma` vs `apps/api/src/**/*.dto.ts`
- **Opis:** Prisma schema definiuje `isDeleted` w Product, ale API DTO nie zawiera tego pola. Brak walidacji Zod dla wielu pól (np. `tags` jako `String[]` w Prisma, ale brak walidacji w DTO).
- **Przykład:** `admin.service.ts` używa `where: { isDeleted: false }`, ale `schema.prisma` w wycinku nie pokazuje tego pola (prawdopodobnie zostało dodane w kodzie, ale schema może być nieaktualna).

#### H2: Brak testów w frontendzie (web i dashboard)
- **Lokalizacja:** `apps/web/`, `apps/dashboard/`
- **Opis:** Oba frontendy mają w `package.json`: `"test": "echo \"No tests yet\""`. Brak testów jednostkowych, integracyjnych i E2E.
- **Ryzyko:** Regresje przy zmianach, brak confidence przy deploymentach.

#### H3: WebSocket Gateway — brak autentykacji na poziomie połączenia
- **Lokalizacja:** `apps/api/src/gateway/orders.gateway.ts`
- **Opis:** Gateway pozwala na dołączenie do roomów bez weryfikacji JWT. Klient może subskrybować `order:{anyId}` i otrzymywać dane cudzych zamówień.
- **Ryzyko:** Wyciek danych zamówień (PII: adresy, telefony).

#### H4: Middleware dashboardu — weryfikacja JWT w Next.js middleware
- **Lokalizacja:** `apps/dashboard/middleware.ts`
- **Opis:** Middleware używa `jose` do weryfikacji JWT, ale `JWT_SECRET` jest czytany z `process.env` w czasie buildu. W Next.js middleware działa w Edge Runtime, gdzie `process.env` może nie być dostępny w runtime (zależy od konfiguracji). Dodatkowo, sekret jest hardcoded fallback: `'dev-secret-change-me'`.
- **Ryzyko:** Potencjalne obejście autentykacji w dashboardzie.

#### H5: API `tsconfig.json` — wyłączone strict checks
- **Lokalizacja:** `apps/api/tsconfig.json`
- **Opis:** `"strictNullChecks": false`, `"noImplicitAny": false`, `"strictBindCallApply": false`, `"forceConsistentCasingInFileNames": false`
- **Ryzyko:** Błędy typowania nie są łapane w czasie kompilacji. To sprzeczne z zasadą "Strict mode włączony" z README-AI.md.

---

### 🟡 ŚREDNIE (MEDIUM)

#### M1: Niespójność nazewnictwa API — `webApi` vs `api`
- **Lokalizacja:** `apps/web/lib/api.ts` eksportuje `api`, ale `apps/web/lib/use-create-order.ts` importuje `webApi` (który nie istnieje w `api.ts`)
- **Opis:** `use-create-order.ts` ma `import { webApi } from "./api"`, ale `api.ts` eksportuje `api` (nie `webApi`). To spowoduje błąd runtime.

#### M2: Brak obsługi błędów w wielu hookach React
- **Lokalizacja:** `apps/web/lib/hooks.ts`, `apps/dashboard/lib/hooks.ts`
- **Opis:** Hooki `useMenu`, `useOrders`, `useStats` nie mają retry logic ani exponential backoff. Przy chwilowej niedostępności API, UI zawiesza się na stanie error.

#### M3: Brak walidacji numeru telefonu w seed data
- **Lokalizacja:** `apps/api/prisma/seed.ts`
- **Opis:** Numery telefonów w seedzie (`+48123456789`) są poprawne, ale brak walidacji formatu w DTO (np. `+48` wymagany).

#### M4: Docker Compose dev — brak healthcheck dla API
- **Lokalizacja:** `infra/docker/docker-compose.yml`
- **Opis:** Web i dashboard mają `depends_on: [api]`, ale API nie ma healthchecka. Docker Compose v2+ wymaga `condition: service_healthy` lub `service_started`.

#### M5: Nginx — brak upstream dla WebSocket
- **Lokalizacja:** `infra/nginx/nginx.conf`
- **Opis:** Konfiguracja WebSocket w nginx wymaga `proxy_set_header Connection "upgrade"` i `proxy_set_header Upgrade $http_upgrade`, ale brakuje osobnego upstream dla WS (port 4001). Aktualnie WS jest na tym samym upstream co API (port 4000).

#### M6: Brak obsługi CORS w produkcji
- **Lokalizacja:** `apps/api/src/main.ts`
- **Opis:** W `main.ts` nie widzę wywołania `app.enableCors()`. NestJS domyślnie blokuje CORS. W dev to działa przez Docker network, ale w produkcji (Nginx reverse proxy) może powodować problemy.

#### M7: Brak limitu rozmiaru uploadu
- **Lokalizacja:** `apps/api/src/upload/upload.service.ts`
- **Opis:** Brak walidacji rozmiaru pliku (np. max 5MB) i typu MIME w upload service.

#### M8: Brak obsługi rate limiting na poziomie endpointu
- **Lokalizacja:** `apps/api/src/main.ts`
- **Opis:** ThrottlerModule jest skonfigurowany globalnie (10r/s), ale brak bardziej restrykcyjnych limitów na wrażliwych endpointach (np. `/auth/login` — max 5 prób/min).

#### M9: Brak walidacji `idempotencyKey` w API
- **Lokalizacja:** `apps/api/src/orders/orders.service.ts`
- **Opis:** Frontend wysyła `idempotencyKey` (w `use-create-order.ts`), ale backend nie sprawdza czy taki klucz już istnieje. Może to prowadzić do podwójnych zamówień.

#### M10: Brak obsługi anulowania zamówienia przez klienta
- **Lokalizacja:** `apps/api/src/orders/orders.controller.ts`
- **Opis:** Brak endpointu `DELETE /orders/:id` lub `PATCH /orders/:id/status` z `cancelled` dla klienta (tylko admin może zmieniać statusy).

---

### 🟢 NISKIE (LOW)

#### L1: Brak `loading.tsx` w Next.js App Router
- **Lokalizacja:** `apps/web/app/`, `apps/dashboard/app/`
- **Opis:** Brak plików `loading.tsx` — Next.js nie pokazuje skeleton loaderów podczas ładowania stron.

#### L2: Brak `not-found.tsx` w web
- **Lokalizacja:** `apps/web/app/`
- **Opis:** Brak customowej strony 404.

#### L3: Brak komentarzy JSDoc w wielu serwisach
- **Lokalizacja:** `apps/api/src/orders/orders.service.ts`, `apps/api/src/payments/payments.service.ts`
- **Opis:** Funkcje publiczne nie mają dokumentacji JSDoc.

#### L4: Brak `robots.txt` i `humans.txt`
- **Lokalizacja:** `apps/web/public/`
- **Opis:** Brak plików SEO.

#### L5: Brak `sitemap.xml` — wspomniany w planie, ale nie zaimplementowany
- **Lokalizacja:** `apps/web/public/sitemap.xml` — BRAK

#### L6: Niespójność wersji `lucide-react`
- **Lokalizacja:** `apps/web/package.json` vs `apps/dashboard/package.json`
- **Opis:** Web nie ma `lucide-react` w dependencies, ale używa ikon w kodzie (importy z `lucide-react`). Dashboard ma `lucide-react@^0.400.0`.

#### L7: Brak `package-lock.json` w repo
- **Lokalizacja:** `/package-lock.json` — BRAK
- **Opis:** Dockerfiles kopiują `package-lock.json`, ale plik nie istnieje. Build Docker zawiedzie.

---

## 📋 AUDIT MODUŁ PO MODULE

### 1. ROOT / Monorepo
| Aspekt | Ocena | Uwagi |
|--------|-------|-------|
| `package.json` | ❌ BRAK | Krytyczny brak — monorepo nie działa |
| `package-lock.json` | ❌ BRAK | Build Docker zawiedzie |
| `pnpm-workspace.yaml` | ❌ BRAK | Używają npm workspaces, ale brak root pkg |
| `turbo.json` | ✅ Dobry | Pipeline z build, dev, lint, test, db:* |
| `.gitignore` | ✅ Dobry | Zawiera `.env`, `node_modules`, `dist` |
| `.env.example` | ✅ Bardzo dobry | Kompletna, z komentarzami |

### 2. Backend (`apps/api/`)
| Aspekt | Ocena | Uwagi |
|--------|-------|-------|
| Architektura | ✅ Bardzo dobra | Modularna, czysta separacja odpowiedzialności |
| Prisma Schema | ✅ Bardzo dobra | 17 modeli, relacje, indeksy, cascade delete |
| Seed data | ✅ Bardzo dobra | Kompletne menu, upsell, admin user |
| Auth (JWT) | ✅ Bardzo dobra | Access + refresh, HttpOnly cookies, rotation |
| RBAC | ✅ Bardzo dobra | 5 ról, RolesGuard, @Roles decorator |
| Rate Limiting | ✅ Dobry | ThrottlerModule (10r/s, 100r/m) |
| Walidacja | ✅ Bardzo dobra | ZodValidationPipe na wszystkich endpointach |
| Swagger/OpenAPI | ✅ Bardzo dobra | Pełna dokumentacja API |
| WebSocket | ⚠️ Średnia | Brak autentykacji na poziomie połączenia |
| Testy E2E | ✅ Dobry | 3 pliki: auth, menu, orders |
| TypeScript strict | ❌ Słaby | Wyłączone strictNullChecks, noImplicitAny |
| Obsługa błędów | ✅ Bardzo dobra | GlobalExceptionFilter, standardowy format |
| Security headers | ✅ Bardzo dobra | Helmet z CSP, HSTS |

### 3. Frontend Web (`apps/web/`)
| Aspekt | Ocena | Uwagi |
|--------|-------|-------|
| Strona główna | ⚠️ Prototyp | UI jest, ale bez real API (mock data) |
| Torba (bag) | ⚠️ Prototyp | Działa z localStorage, brak sync z API |
| Checkout | ⚠️ Prototyp | Formularze są, brak integracji płatności |
| Śledzenie | ⚠️ Prototyp | Strona jest, brak real-time updates |
| PWA | ⚠️ Częściowo | manifest.json i sw.js są, ale sw.js to stub |
| SEO | ⚠️ Częściowo | Meta tagi są, brak sitemap.xml, robots.txt |
| Responsywność | ✅ Dobra | Tailwind, mobile-first |
| Animacje | ✅ Bardzo dobra | CSS keyframes, fly-to-bag, confetti |
| Testy | ❌ Brak | `"test": "echo \"No tests yet\""` |

### 4. Dashboard (`apps/dashboard/`)
| Aspekt | Ocena | Uwagi |
|--------|-------|-------|
| Layout | ✅ Dobry | AuthProvider + AuthGuard |
| Strona główna | ✅ Bardzo dobra | Statystyki, WebSocket, quick actions |
| KDS | ✅ Bardzo dobra | Kanban board, timer, status change |
| Zamówienia | ✅ Bardzo dobra | Tabela, filtry, paginacja, detail modal |
| Produkty | ✅ Bardzo dobra | Grid, search, toggle, form modal |
| Logowanie | ✅ Dobry | Formularz, error handling |
| Middleware | ⚠️ Średnie | Potencjalny problem z JWT_SECRET w Edge Runtime |
| WebSocket | ✅ Dobry | Real-time updates z refetch |
| Testy | ❌ Brak | `"test": "echo \"No tests yet\""` |

### 5. Printer Service (`apps/printer-service/`)
| Aspekt | Ocena | Uwagi |
|--------|-------|-------|
| Implementacja | ❌ Brak | Tylko stub `console.log("started")` |
| Konfiguracja | ✅ Dobra | package.json, tsconfig, Dockerfile gotowe |
| Redis queue | ❌ Brak | Nie zaimplementowana |
| ESC/POS | ❌ Brak | Nie zaimplementowane |
| Szablony | ❌ Brak | Nie zaimplementowane |

### 6. Packages
| Pakiet | Ocena | Uwagi |
|--------|-------|-------|
| `shared-types` | ✅ Bardzo dobra | Kompletne typy, enumy, interfejsy |
| `ui` | ✅ Bardzo dobra | shadcn/ui + 10 custom components, tokens, animacje |
| `config` | ✅ Bardra | tsconfig strict, ESLint flat config, Prettier |

### 7. Infrastruktura
| Aspekt | Ocena | Uwagi |
|--------|-------|-------|
| Docker Compose dev | ✅ Bardzo dobra | Healthchecki, volumes, networks |
| Docker Compose prod | ✅ Bardzo dobra | Multi-stage, resource limits, restart policies |
| Docker Swarm | ✅ Bardzo dobra | Replicas, placement constraints, rolling updates |
| Dockerfiles | ✅ Bardzo dobra | Multi-stage, Alpine, standalone Next.js |
| Nginx | ✅ Bardzo dobra | SSL, rate limiting, security headers, upstreams |
| GitHub Actions CI | ✅ Bardzo dobra | Lint, typecheck, test, build, multi-platform |
| GitHub Actions CD | ✅ Bardzo dobra | Manual deploy na Raspberry Pi |

---

## 🔧 REKOMENDACJE PRIORYTETOWE

### Priorytet 1 (Tydzień 1)
1. **Usunąć pliki .env z repo i historii gita** — krytyczne dla bezpieczeństwa
2. **Utworzyć root `package.json`** z workspaces — projekt nie zbuduje się bez tego
3. **Utworzyć `package-lock.json`** — build Docker wymaga tego pliku
4. **Włączyć strict mode w API tsconfig** — `strictNullChecks: true`, `noImplicitAny: true`
5. **Dodać autentykację do WebSocket Gateway** — weryfikacja JWT przed dołączeniem do roomów

### Priorytet 2 (Tydzień 2)
6. **Naprawić import `webApi` w `use-create-order.ts`** — zmienić na `api`
7. **Dodać testy do web i dashboard** — minimum: React Testing Library + Jest
8. **Zaimplementować Printer Service** — kolejka Redis, ESC/POS, szablony biletów
9. **Dodać walidację idempotencyKey w API** — uniknięcie podwójnych zamówień
10. **Dodać rate limiting na `/auth/login`** — max 5 prób/min, blokada 15 min

### Priorytet 3 (Tydzień 3)
11. **Dodać `loading.tsx` i `not-found.tsx`** do web i dashboard
12. **Dodać `robots.txt`, `sitemap.xml`, `humans.txt`**
13. **Dodać retry logic do hooków React** — exponential backoff
14. **Dodać walidację uploadu** — max rozmiar, MIME type
15. **Dodać CORS w `main.ts`** — `app.enableCors({ origin: [...] })`

---

## 📈 OCENA OGÓLNA

| Kategoria | Ocena (1-10) | Komentarz |
|-----------|--------------|-----------|
| **Architektura** | 9/10 | Modularna, skalowalna, dobrze przemyślana |
| **Kod backendu** | 8/10 | Czysty, dobrze zorganizowany, ale strict mode wyłączony |
| **Kod frontendu** | 6/10 | Prototypy są ładne, ale brak integracji z API i testów |
| **Bezpieczeństwo** | 5/10 | Wyciek .env, brak WS auth, middleware potencjalnie broken |
| **Dokumentacja** | 9/10 | Bardzo kompletna, 15 plików, prompt system |
| **Infrastruktura** | 9/10 | Docker, Nginx, CI/CD — profesjonalne |
| **Testy** | 4/10 | Tylko 3 pliki E2E w API, brak testów frontendu |
| **UX/UI** | 8/10 | Design system, animacje, koncepcja torby — świetne |
| **Gotowość do produkcji** | 4/10 | Etapy 3-8 nie rozpoczęte, brak płatności, drukarek |

**Średnia ogólna: 6.4/10**

---

## 🎯 PLAN DZIAŁANIA DLA NASTĘPNEJ SESJI AI

### Zadanie 1: Fix krytycznych błędów (1 sesja)
- Usunąć .env z repo
- Utworzyć root package.json + package-lock.json
- Włączyć strict mode w API
- Naprawić import webApi

### Zadanie 2: Implementacja Etapu 3 — Frontend Web (3-4 sesje)
- Podłączyć stronę główna do real API
- Podłączyć torba do API (sync z backendem dla zalogowanych)
- Zaimplementować checkout z walidacją
- Zaimplementować śledzenie zamówienia z WebSocket

### Zadanie 3: Implementacja Etapu 4 — Dashboard Admin (2-3 sesje)
- CRUD produktów z uploadem zdjęć
- CRUD kategorii z drag & drop
- Raporty i statystyki
- Konfiguracja strony (SiteConfig)

### Zadanie 4: Implementacja Etapu 5 — KDS + Drukarki (2 sesje)
- Kanban board w KDS
- Printer Service — kolejka Redis, ESC/POS
- Szablony biletów (kuchenny + kierowcy)

### Zadanie 5: Implementacja Etapu 6 — Płatności (2 sesje)
- Stripe integration
- PayU integration
- Webhook security
- 3D Secure

### Zadanie 6: Testy i optymalizacja (2 sesje)
- Testy jednostkowe frontendu
- Testy E2E (Playwright)
- Lighthouse audit
- PWA audit

---

*Raport wygenerowany automatycznie przez AI. Zaleca się review przez senior developera przed wdrożeniem poprawek.*

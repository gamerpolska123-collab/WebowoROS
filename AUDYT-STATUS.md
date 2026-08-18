# AUDYT-STATUS.md
## Stan projektu WebowoROS — aktualizacja 2026-08-18

> **UWAGA**: Ten dokument jest JEDYNYM wiarygodnym źródłem stanu projektu. Wszystkie poprzednie dokumenty (AUDYT.md, AUDYT-README.md, PODSUMOWANIE-AUDYTU.md, README-AI.md) zawierają nieaktualne lub fałszywe informacje.

---

## 1. ARCHITEKTURA

Monorepo Turborepo + npm workspaces:
- `apps/api` — NestJS + Prisma + PostgreSQL + Redis (backend)
- `apps/web` — Next.js 14 App Router (strona klienta)
- `apps/dashboard` — Next.js 14 App Router (panel admina/KDS)
- `apps/printer-service` — Node.js (drukarki ESC/POS)
- `packages/shared-types` — TypeScript enums i interfejsy
- `packages/ui` — shadcn/ui + custom components
- `packages/config` — tsconfig, eslint, prettier

---

## 2. STAN UKOŃCZENIA (szacunkowy)

| Moduł | % | Uwagi |
|-------|---|-------|
| Backend API (NestJS) | ~70% | Brak WS emit, OrderStatusHistory, pełnych płatności |
| Frontend Web (Next.js) | ~55% | Checkout mockowany, bag bez sync z API, brak retry |
| Dashboard (Next.js) | ~65% | Raporty nie działają, formularz produktów uproszczony |
| UI Components (@ros/ui) | ~75% | Brak CSS variables, niektóre komponenty niekompletne |
| Printer Service | ~40% | Wymaga weryfikacji pełnej logiki drukowania |
| DevOps / Docker | ~50% | Brak CI/CD, wymaga weryfikacji nginx |
| Testy | ~20% | Konfiguracja istnieje, brak pokrycia |

---

## 3. PROBLEMY KRYTYCZNE (blokujące budowę / bezpieczeństwo / działanie)

| ID | Problem | Konsekwencja | Lokalizacja |
|----|---------|-------------|-------------|
| K1 | **Brak root package.json** (NAPRAWIONO W TYM ZIP-ie) | Monorepo nie dało się zainstalować | Root — dodano nowy plik |
| K2 | **Plik `.env` w repozytorium** | Wrażliwe dane produkcyjne w git | Root — USUNIĘTO z ZIP, użyj `.env.example` |
| K3 | **API tsconfig — strict mode wyłączony** | Brak type-safety, błędy runtime | `apps/api/tsconfig.json` |
| K4 | **Brak package-lock.json** | Brak deterministycznych wersji | Root |
| K5 | **Brak .github/workflows/** | Brak CI/CD | `.github/` |
| K6 | **Komponent `product-card` używa `Image` bez importu** | Błąd kompilacji | `packages/ui/src/components/product-card.tsx` |
| K7 | **`dashApi.getSalesReport` nie istnieje** | Runtime error w raportach | `apps/dashboard/lib/api.ts` |

---

## 4. PROBLEMY WYSOKIE (funkcjonalne / architektoniczne)

| ID | Problem | Konsekwencja |
|----|---------|-------------|
| W1 | Inconsistency WebSocket — KDS używa native WS, reszta socket.io | Dwa protokoły na jednym porcie = konflikt |
| W2 | Zduplikowane mapy statusów zamówień (~6 plików) | Zmiana wymaga edycji 6 miejsc, naruszenie DRY |
| W3 | Komponenty UI używają niezdefiniowanych klas Tailwind (`bg-primary`, `text-primary-foreground`) | Komponenty będą niewidoczne lub źle ostylowane |
| W4 | Brak obsługi wariantów i addonów w formularzu produktu (dashboard) | Admin nie może zarządzać rozmiarami pizzy ani dodatkami |
| W5 | Checkout (web) — mock data / brak pełnej integracji API | Klient nie może złożyć prawdziwego zamówienia |
| W6 | Bag — brak synchronizacji z API dla zalogowanych | Koszyk tylko localStorage, brak sync między urządzeniami |
| W7 | Brak endpointu anulowania zamówienia dla klienta | Tylko admin może anulować |
| W8 | Brak `OrderStatusHistory` w orders.service | Brak audytu zmian statusów |
| W9 | Brak emisji WebSocket w orders.service | KDS i klient nie dostają real-time updates |
| W10 | Payments — brak pełnej integracji Stripe/PayU | Logika mockowana |
| W11 | Upload — brak whitelisty rozszerzeń w upload.service | Potencjalne bezpieczeństwo |
| W12 | WS auth bez `@UseGuards` | Ręczna weryfikacja JWT, podatne na błędy |
| W13 | Brak globalnego ZodValidationPipe | Niektóre endpointy mogą nie mieć walidacji |
| W14 | `fetchWithRetry` przed dyrektywą `"use client"` | Next.js może niepoprawnie przetworzyć plik |
| W15 | Dashboard auth-context — brak obsługi błędów w login | Uncaught exception przy błędzie API |
| W16 | Dashboard auth-guard — `router.replace` w useEffect | Race conditions w React 18 |
| W17 | Web page.tsx — `window.location.reload()` w obsłudze błędu | Antypattern, pełne przeładowanie |
| W18 | Użycie `alert()` i `confirm()` w ~10 miejscach | Blokuje wątek główny, zły UX na mobile |
| W19 | Dashboard api.ts — brak obsługi 401/403 | Przy wygaśnięciu sesji brak redirectu do loginu |
| W20 | `PizzaBag` — niepoprawna polska odmiana | "1 item" / "2 itemy" zamiast polskich form |
| W21 | Wiele komponentów UI używa `<img>` zamiast `<Image>` z Next.js | Brak optymalizacji obrazów |
| W22 | Dashboard middleware.ts — `JWT_SECRET` z process.env | W Next.js middleware env może być undefined |
| W23 | Web layout.tsx — `QueryClientProvider` w root layout | Może powodować błędy hydracji |
| W24 | Web layout.tsx — inline script dla SW w root layout | Powinno być w osobnym klienckim komponencie |

---

## 5. PROBLEMY ŚREDNIE

- S1: Fałszywe stwierdzenia w README-AI.md (dezinformacja)
- S2: Duplikaty dokumentacji (AUDYT.md, PODSUMOWANIE-AUDYTU.md, README-AI.md — sprzeczne info)
- S3: Brak gzip w Nginx (wymaga weryfikacji)
- S4: Brak healthcheck w docker-compose dev
- S5: Brak restart policies w docker-compose dev
- S6: Brak retry logic w web hooks
- S7: Brak storybook dla @ros/ui
- S8: Brak testów jednostkowych w @ros/ui
- S9: Brak testów E2E dla krytycznych ścieżek
- S10: Web middleware.ts — wymaga weryfikacji
- S11: Web track/[orderId] — wymaga weryfikacji
- S12: Web cart-context — wymaga weryfikacji obsługi wariantów i addonów

---

## 6. CO ZOSTAŁO PRZECZYTANE W PEŁNI

- Root: README.md, README-AI.md, AUDYT.md, PODSUMOWANIE-AUDYTU.md, CHANGELOG.md, CONTRIBUTING.md, INSTALL.md, NEXT-STEPS.md, PROMPT.md, SECURITY.md, LICENSE, .env.example, .gitignore, .dockerignore, turbo.json
- apps/api: package.json, tsconfig.json, main.ts, app.module.ts, prisma/schema.prisma, prisma/seed.ts, prisma/seed-upsell.ts, auth/*, orders/*, menu/*, admin/*, payments/*, gateway/*, upload/*, prisma/*, redis/*, health/*, metrics/*, common/*, system/*
- apps/web: package.json, tsconfig.json, next.config.js, tailwind.config.ts, middleware.ts, layout.tsx, page.tsx, globals.css, checkout/*, menu/page.tsx, bag/page.tsx, track/page.tsx, login/page.tsx, lib/api.ts, lib/auth-context.tsx, lib/cart-context.tsx, lib/hooks.ts, lib/query-client.ts, lib/use-create-order.ts, public/sw.js, public/manifest.json
- apps/dashboard: package.json, tsconfig.json, next.config.js, tailwind.config.ts, middleware.ts, layout.tsx, page.tsx, globals.css, orders/*, products/*, categories/*, kds/page.tsx, reports/*, lib/api.ts, lib/auth-context.tsx, lib/auth-guard.tsx, lib/hooks.ts, lib/use-orders-ws.ts, lib/product-schema.ts, components/dashboard-shell.tsx
- packages/shared-types: package.json, tsconfig.json, src/index.ts
- packages/ui: package.json, tsconfig.json, src/index.ts, src/lib/utils.ts, src/styles/animations.css, src/tokens/*, src/components/button.tsx, card.tsx, input.tsx, badge.tsx, dialog.tsx, tabs.tsx, toast.tsx, pizza-bag.tsx, product-card.tsx, fly-to-bag.tsx, upsell-modal.tsx, bundle-builder.tsx, free-delivery-progress.tsx, addon-configurator.tsx, checkout-timeline.tsx, last-minute-addons.tsx, pizza-builder.tsx

---

## 7. CO WYMAGA WERYFIKACJI (nieprzeczytane / częściowo)

- `infra/docker/` — wszystkie Dockerfile, docker-compose.yml, docker-compose.prod.yml, docker-compose.swarm.yml, docker-compose.test.yml
- `infra/nginx/nginx.conf`
- `apps/printer-service/src/index.ts` — cała logika drukowania
- `apps/web/__tests__/*` — testy jednostkowe web
- `apps/dashboard/__tests__/*` — testy jednostkowe dashboard
- `e2e/*` — testy Playwright
- `packages/config/*` — eslint.config.js, prettier.config.js, tsconfig.base.json
- `apps/api/test/*` — testy E2E backendu
- `apps/web/middleware.ts` — wymaga pełnej analizy
- `apps/web/app/track/[orderId]/page.tsx`
- `apps/web/lib/cart-context.tsx` — wymaga głębszej analizy obsługi wariantów/addonów

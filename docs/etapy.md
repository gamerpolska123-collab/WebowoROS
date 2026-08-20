# Etapy Implementacji ROS

## Etap 0: Infrastruktura i Setup
**Status:** ✅ Zakończony

### Deliverables
- [x] Monorepo Turborepo + pnpm workspaces
- [x] TypeScript strict mode + ESLint + Prettier
- [x] Struktura katalogów: apps/, packages/, infra/
- [x] Aplikacje: api, web, dashboard, printer-service
- [x] Docker Compose dev (PostgreSQL 16 + Redis 7)
- [x] 4 Dockerfile'y (multi-stage, Alpine, standalone)
- [x] GitHub Actions CI (lint + typecheck + test + build)
- [x] GitHub Actions CD (manual deploy na Raspberry Pi)
- [x] Pliki .env.example (root + 4 aplikacje)

---

## Etap 1: Design System i Prototypy UX
**Status:** ✅ Zakończony

### Deliverables
- [x] Design Tokens (colors, typography, spacing, animations)
- [x] shadcn/ui base components (Button, Card, Input, Badge, Dialog, Tabs, Toast)
- [x] Custom pizza components (PizzaBag, ProductCard, FlyToBag, UpsellModal, BundleBuilder, FreeDeliveryProgress, AddonConfigurator, CheckoutTimeline, LastMinuteAddons, PizzaBuilder)
- [x] Animacje CSS (10 keyframes: flyToBag, shake, pulseBorder, squashStretch, confettiFall, slideUp, fadeIn, scaleIn, bounceIn, float)
- [x] Tailwind config z custom colors i animations (web + dashboard)
- [x] Prototyp strony głównej (hero, kategorie, grid produktów, upsell modal, free delivery progress, sticky bottom bar, adres, opinie, PWA)
- [x] Prototyp torby (bag) z wizualizacją, usuwaniem itemów, podsumowaniem
- [x] Prototyp checkout (3-krokowy: torba → dane → płatność, timeline, formularze, last-minute addons)
- [x] Prototyp menu (kategorie tabs, grid produktów, filtry)
- [x] Prototyp track (śledzenie zamówienia, timeline 5 kroków)
- [x] Prototyp dashboard (sidebar, stat cards, tabela zamówień, quick actions)
- [x] Prototyp KDS (karty zamówień, advance status, badge liczniki)
- [x] Prototyp produkty (grid, search, toggle active, badges)
- [x] Prototyp zamówienia (lista, filtry statusów, akcje status change)

---

## Etap 2: Backend Core
**Status:** ✅ Zakończony

### Deliverables
- [x] Prisma schema (17 models, 11 enums, indexes, relations, cascade delete)
- [x] Seed data (seed.ts: 5 categories, 13 products, variants, addons, badges, admin user)
- [x] Seed upsell configs (seed-upsell.ts: 3 upsell configs, 2 bundles, 3 promos)
- [x] NestJS modules (Auth, Menu, Orders, Admin, Prisma, Redis, Gateway)
- [x] JWT authentication (access + refresh tokens, HttpOnly cookies, token rotation)
- [x] RBAC (RolesGuard, @Roles decorator, 5 role levels)
- [x] CRUD API dla produktów i kategorii (Admin module)
- [x] Order creation flow (walidacja produktów, wariantów, addonów, kalkulacja ceny, status transitions)
- [x] Redis caching (menu cache 5min, product cache 10min, cache invalidation)
- [x] Rate limiting (ThrottlerModule: 10r/s, 100r/m)
- [x] Security middleware (Helmet, CORS, cookie-parser, CSP headers)
- [x] WebSocket Gateway (join_order, join_kitchen, join_driver, emit methods)
- [x] Zod validation pipe (global validation, detailed error responses)
- [x] Global exception filter (standardized error format)
- [x] E2E tests (auth, menu, orders — Supertest + Jest)

---

## Etap 3: Frontend Web
**Status:** ❌ Nie rozpoczęty

### Plan
- [ ] Strona główna z real API (produkty, kategorie z backendu)
- [ ] Torba (bag) z real-time updates (Socket.io)
- [ ] Checkout z walidacją formularzy (Zod + React Hook Form)
- [ ] Strona śledzenia zamówienia (track/{orderId})
- [ ] Animacje: fly-to-bag, confetti, shake, squash-stretch
- [ ] Dźwięki (add-to-bag, order-confirmed)
- [ ] Social proof (toast z ostatnimi zamówieniami)
- [ ] Responsive design (mobile-first)
- [ ] SEO (meta tags, structured data)

---

## Etap 4: Panel Administracyjny
**Status:** ❌ Nie rozpoczęty

### Plan
- [ ] Auth guard (login, JWT, role-based access)
- [ ] CRUD produktów (zdjęcia, warianty, addony, allergeny)
- [ ] CRUD kategorii (drag & drop sortowanie)
- [ ] Zarządzanie zamówieniami (lista, filtry, zmiana statusu)
- [ ] KDS (Kitchen Display System) z Socket.io
- [ ] Statystyki i raporty (dzienne, tygodniowe, miesięczne)
- [ ] Zarządzanie dostawcami (lista, status, historia)
- [ ] Konfiguracja strony (kolory, animacje, dźwięki, progi darmowej dostawy)

---

## Etap 5: System Dostaw i KDS
**Status:** ❌ Nie rozpoczęty

### Plan
- [ ] KDS z Socket.io (real-time nowe zamówienia)
- [ ] Timer przygotowania (countdown od przyjęcia zamówienia)
- [ ] Przypisywanie dostawców do zamówień
- [ ] Mapa dostaw (Leaflet.js z trasą)
- [ ] Statusy dostawy (przygotowanie → gotowe → w drodze → dostarczone)
- [ ] Powiadomienia SMS (Twilio) o statusie zamówienia
- [ ] Historia tras dostawcy

---

## Etap 6: Drukarki i Fiskalność
**Status:** ❌ Nie rozpoczęty

### Plan
- [ ] Integracja node-escpos (drukarki termiczne USB)
- [ ] Format biletu wewnętrznego (zamówienie, adres, produkty, cena)
- [ ] Drukowanie automatyczne po potwierdzeniu zamówienia
- [ ] Drukowanie na żądanie z dashboardu
- [ ] Testy z drukarką Epson TM-T20III
- [ ] Obsługa błędów drukowania (fallback: PDF)

---

## Etap 7: Płatności Online
**Status:** ❌ Nie rozpoczęty

### Plan
- [ ] Stripe integration (karty, Google Pay, Apple Pay)
- [ ] PayU integration (BLIK, przelewy)
- [ ] Webhook handlers (Stripe + PayU)
- [ ] Obsługa zwrotów (refundy)
- [ ] Bezpieczne przechowywanie kluczy API (environment variables)
- [ ] Testy płatności (Stripe test mode, PayU sandbox)
- [ ] Walidacja płatności (podpis webhook, idempotency)

---

## Etap 8: Optymalizacja i Deployment
**Status:** ❌ Nie rozpoczęty

### Plan
- [ ] Docker Compose production (multi-stage builds, health checks)
- [ ] Nginx reverse proxy (SSL, rate limiting, caching)
- [ ] Let's Encrypt SSL certificates (auto-renewal)
- [ ] Raspberry Pi 4 setup (Docker, networking, firewall)
- [ ] CI/CD pipeline (GitHub Actions → Docker Hub → Raspberry Pi)
- [ ] Monitoring (Prometheus + Grafana)
- [ ] Log aggregation (Loki)
- [ ] Backup strategy (PostgreSQL daily dumps)
- [ ] Performance optimization (lazy loading, image optimization, code splitting)
- [ ] Security audit (OWASP Top 10, dependency scanning)
- [ ] Documentation (API docs, deployment guide, user manual)

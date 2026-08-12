# README-AI.md — Instrukcja Kontynuacji Projektu

> **Ten plik służy jako kontekst dla nowej sesji AI.**
> Wklej całą zawartość tego pliku (lub załącz jako attachment) na początku nowej rozmowy, aby AI mogło płynnie kontynuować pracę nad projektem.

---

## 1. O PROJEKCIE

**Nazwa robocza**: Restaurant Order System (ROS)
**Cel**: Kompleksowy system zamówień online dla restauracji (pizzerii), działający wyłącznie we własnym kanale sprzedażowym — bez agregatorów (pyszne.pl, Glovo). System ma maksymalizować wartość zamówienia (AOV) przez zaawansowane mechanizmy upsellu i triki psychologiczne (CRO).

**Właściciel projektu**: Restauracja (dane poufne — nazwa, adres, logo zostaną wdrożone w finalnej fazie).
**Deployment**: Raspberry Pi 4 (ARM64), Docker, GitHub Actions CI/CD.
**Sprzedaż**: System będzie sprzedany firmie po ukończeniu.

---

## 2. TECH STACK

| Warstwa | Technologia |
|---------|-------------|
| Frontend (klient) | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Dashboard | Next.js 14, TypeScript, Tailwind, shadcn/ui |
| Backend | NestJS (Node.js), TypeScript, Prisma ORM |
| Baza danych | PostgreSQL 16 |
| Cache / Queue / PubSub | Redis 7 |
| Real-time | Socket.io |
| Drukarki | Node.js Printer Service (node-escpos + CUPS) |
| Płatności | Stripe + PayU |
| Konteneryzacja | Docker + Docker Compose (multi-arch: AMD64 + ARM64) |
| Reverse Proxy | Nginx + Let's Encrypt SSL |
| Monorepo | Turborepo + pnpm workspaces |
| CI/CD | GitHub Actions |

---

## 3. ARCHITEKTURA

```
[KLIENT] → Nginx (:80/443) → [Next.js Web :3000]
                                [Next.js Dashboard :3001]
                                [NestJS API :4000]
                                [Socket.io WS :4001]
                                [Printer Service :5000]
                                    ↓
                              [PostgreSQL :5432]
                              [Redis :6379]
                              [Thermal Printers USB/NET]
```

Struktura repo:
```
restaurant-order-system/
├── apps/
│   ├── web/                 # Strona dla klientów (Next.js)
│   ├── dashboard/           # Panel admina/kuchni/kierowcy
│   ├── api/                 # Backend API (NestJS)
│   └── printer-service/     # Serwis drukarek (Node.js)
├── packages/
│   ├── shared-types/        # Wspólne typy TypeScript
│   ├── ui/                  # Wspólne komponenty shadcn/ui
│   └── config/              # ESLint, TS config
├── infra/
│   ├── docker/              # Dockerfile'y + docker-compose
│   └── nginx/               # Nginx config + SSL
└── docs/                    # Dokumentacja (11 plików)
```

---

## 4. STAN PROJEKTU

✅ Dokumentacja: Kompletna w folderze docs/:
- README.md, etapy.md, architektura.md, ui-ux.md, api.md
- docker.md, hardware.md, security.md, setup.md
- github-workflow.md, moduly-przyszlosci.md

❌ Kod: Nie rozpoczęty. Brak repozytorium kodu.
❌ Etap 1-8: Nie rozpoczęte.

Aktualny status: Projekt na etapie PRZED IMPLEMENTACJĄ.
Następny krok: Stworzenie repozytorium kodu i rozpoczęcie Etapu 0.

---

## 5. ETAPY IMPLEMENTACJI

### ETAP 0 — Infrastruktura i Setup (Tydzień 1)
Cel: Gotowe środowisko deweloperskie z działającymi kontenerami.

Deliverables:
1. Inicjalizacja monorepo (Turborepo + pnpm workspaces)
2. Konfiguracja TypeScript (strict), ESLint, Prettier
3. Struktura katalogów (apps/, packages/)
4. Inicjalizacja apps/api (NestJS)
5. Inicjalizacja apps/web (Next.js 14 App Router) + Tailwind + shadcn/ui
6. Inicjalizacja apps/dashboard (Next.js 14) + Tailwind + shadcn/ui
7. Inicjalizacja apps/printer-service (Node.js + TypeScript)
8. Pakiet packages/shared-types
9. Pakiet packages/ui
10. Docker Compose dev z PostgreSQL + Redis
11. Dockerfile'y dla wszystkich aplikacji
12. GitHub Actions CI (ci.yml)
13. Pliki .env.example

Kryteria akceptacji:
- pnpm install działa bez błędów
- docker-compose up -d postgres redis uruchamia bazę
- pnpm dev uruchamia wszystkie aplikacje
- Każdy PR przechodzi checki CI

### ETAP 1 — Design System i Prototypy UX (Tydzień 2-3)
Cel: Zaakceptowane projekty UI + komponenty w kodzie.

Deliverables:
- Design System (Figma lub kod)
- Biblioteka komponentów w packages/ui
- Komponenty kluczowe:
  - PizzaBag (torba dostawcza z 4 stanami)
  - ProductCard (z badge'ami)
  - FlyToBagAnimation
  - UpsellModal
  - BundleBuilder
  - FreeDeliveryProgress (termometr)
  - AddonConfigurator
- Prototypy wszystkich ekranów (mobile-first)
- Responsywność: mobile, tablet, desktop

### ETAP 2 — Core Backend & Baza Danych (Tydzień 3-5)
Cel: Działające API + baza z pełnym modelem.

Deliverables:
- Schema Prisma (Category, Product, Variant, ProductAddon, Order, OrderItem, OrderItemAddon, User, UpsellConfig, BundleConfig, PromoConfig, ProductBadge, PriceHistory, SiteConfig)
- REST API v1 (wszystkie endpointy z api.md)
- Autentykacja JWT + HttpOnly cookies + refresh tokens
- WebSocket Gateway (Socket.io)
- Seedery z przykładowym menu
- Testy integracyjne (coverage > 80%)

### ETAP 3 — Frontend Klienta (Tydzień 5-8)
Cel: Pełnoprawna strona do składania zamówień.

Deliverables:
- Strona główna z menu (sticky tabs, parallax, hero)
- Torba dostawcza (4 stany + fly-to-bag animacja)
- Konfigurator pizzy (graficzny wybór dodatków)
- System upsellu (cross-sell, bundles, last-minute, promocje)
- Progress bar darmowa dostawa z confetti
- Checkout (3 kroki)
- Śledzenie zamówienia (timeline + WebSocket)
- PWA (Service Worker, manifest, offline cart)
- SEO (meta, JSON-LD, sitemap)
- Lighthouse score > 90

### ETAP 4 — Dashboard Administratora (Tydzień 8-10)
Cel: Panel zarządzania z natychmiastową synchronizacją.

Deliverables:
- Logowanie i RBAC
- Zarządzanie produktami (inline editing cen, historia, toggle dostępności, drag & drop)
- Zarządzanie upsellem (cross-sell configs, bundles, promos, badges)
- Zarządzanie zamówieniami
- Raporty i statystyki (AOV, konwersja upsellu, godziny szczytu)
- Konfiguracja strony (wygląd, animacje, progi, motyw)
- Eksport CSV/XLSX

### ETAP 5 — KDS i Drukarki (Tydzień 10-12)
Cel: System obsługi kuchni i automatyczne drukowanie.

Deliverables:
- Kitchen Display System (FIFO, Kanban, timer, dźwięki)
- Printer Service (ESC/POS, szablony: kuchenny, kierowcy, paragon)
- Redis Queue + retry logic
- Konfiguracja drukarek w dashboardzie

### ETAP 6 — Płatności i Bezpieczeństwo (Tydzień 12-13)
Cel: Bezpieczne płatności online.

Deliverables:
- Stripe (karty, 3D Secure) + PayU (BLIK)
- Webhooki
- HTTPS + SSL (Let's Encrypt)
- Rate limiting, Helmet.js, CORS, Zod
- RODO/GDPR
- Backup bazy

### ETAP 7 — Optymalizacja i Deployment (Tydzień 13-14)
Cel: Wdrożenie na Raspberry Pi 4.

Deliverables:
- Multi-arch Docker images (ARM64)
- Optymalizacja obrazów
- Nginx (gzip, brotli, cache)
- Monitoring (Prometheus + Grafana / Uptime Kuma)
- Automatyczne backupy
- Watchtower
- Dokumentacja wdrożeniowa

### ETAP 8 — Testy, Szkolenie i Odbiór (Tydzień 14-15)
Cel: Finalne testy i uruchomienie produkcyjne.

Deliverables:
- Testy UAT
- Wdrożenie prawdziwego menu, cen i zdjęć
- Konfiguracja upsellu i promocji
- Konfiguracja drukarek
- Szkolenie personelu
- Dokumentacja użytkownika
- Uruchomienie produkcyjne

---

## 6. ZASADY KODOWANIA

Język:
- Kod, komentarze, nazwy zmiennych: ANGIELSKI
- Dokumentacja użytkownika: POLSKI
- Commit messages: ANGIELSKI (conventional commits)

Styl:
- TypeScript: strict mode
- NestJS: modułowa architektura, DI
- Next.js: App Router, Server Components
- Tailwind: utility-first
- shadcn/ui: bazowe komponenty + rozszerzenia w packages/ui

Commits:
  feat(api): add product upsell configuration endpoints
  fix(web): resolve fly-to-bag animation on Safari
  docs: update deployment guide

Bezpieczeństwo:
- NIGDY nie commituj .env ani sekretów
- Hasła: bcrypt cost=12
- JWT: HttpOnly, Secure, SameSite=Strict cookies
- SQL: tylko Prisma ORM
- Input: walidacja Zod na wszystkich endpointach

Wydajność:
- Next.js: output standalone w produkcji
- Obrazy: WebP/AVIF, lazy loading
- Cache: Redis dla menu (5min), sesje (24h)
- WebSocket: broadcast tylko do relevant rooms

---

## 7. KONTEKST BIZNESOWY

Model przychodów:
- Marża na pizzy: ~60-70%
- Marża na napojach: ~80-90% (upsell napojów = priorytet)
- Koszt dostawy: ~8-12 zł
- Cel AOV: podnieść z ~45 zł do ~65 zł przez upsell

Kluczowe KPI:
- Konwersja: > 15%
- AOV: > 60 zł
- Upsell conversion: > 30%
- Cart abandonment: < 60%

---

## 8. INFORMACJE POUFNE (Placeholder)

NIE WPROWADZAJ PRAWDZIWYCH DANYCH DO KODU.

| Dane | Placeholder | Wdrożenie |
|------|------------|-----------|
| Nazwa restauracji | "Restaurant Name" / process.env.RESTAURANT_NAME | Etap 8 |
| Adres | " , " | Etap 8 |
| Logo | /logo-placeholder.svg | Etap 8 |
| Telefon | +48 000 000 000 | Etap 8 |
| Domena | localhost:3000 / example.com | Etap 7 |
| Kolory brandu | Primary: #E63946 | Etap 1 |

Wszystkie dane identyfikujące z process.env lub tabeli SiteConfig.

---

## 8.5 LICENCJE I PRAWO DO ODSRPZEDAŻY (KLUCZOWE)

System został zbudowany WYŁĄCZNIE na technologiach open-source z licencjami permissive:
- MIT: Next.js, React, NestJS, Socket.io, Tailwind, shadcn/ui, bcrypt, Zod, Jest
- Apache 2.0: TypeScript, Prisma, Docker, Playwright
- BSD: PostgreSQL, Redis OSS, Nginx
- OFL: Czcionki (Poppins, Inter) — self-hosted

CO TO OZNACZA:
- ✅ Możesz odsprzedać system firmie bez płacenia licencji
- ✅ Nie musisz ujawniać kodu źródłowego (brak GPL/AGPL/SSPL)
- ✅ Nie płacisz royalty

CO TRZEBA ZACHOWAĆ:
- Informacje o licencjach bibliotek w kodzie (komentarze)
- Pliki LICENSE w node_modules (pnpm robi to automatycznie)

CZEGO UNIKAMY:
- Redis Stack (SSPL) — używamy Redis OSS (BSD)
- MongoDB (SSPL) — używamy PostgreSQL
- Docker Desktop na produkcji — używamy Docker Engine (darmowy na Linux)
- Google Fonts CDN — czcionki self-hosted (RODO + niezależność)

Szczegółowy audyt: docs/licencje.md

---

## 9. JAK KONTYNUOWAĆ (dla AI)

1. Przeczytaj wszystkie pliki w docs/
2. Zapytaj użytkownika, który etap rozpoczynamy (domyślnie: Etap 0)
3. Rozpocznij od inicjalizacji repozytorium
4. Pracuj etapami — nie przechodź dalej bez zakończenia poprzedniego
5. Testuj na bieżąco
6. Pytaj o decyzje przy wyborach architektonicznych
7. Dokumentuj zmiany

---

## 10. PLIKI DO PRZECZYTANIA

| Plik | Kiedy |
|------|-------|
| docs/README.md | Zawsze na start |
| docs/etapy.md | Przed każdym etapem |
| docs/architektura.md | Przed backendem / bazą |
| docs/ui-ux.md | Przed frontendem |
| docs/api.md | Przed API |
| docs/docker.md | Przed kontenerami |
| docs/setup.md | Przed pierwszym uruchomieniem |
| docs/security.md | Przed płatnościami / auth |
| docs/hardware.md | Przed deploymentem na RPi |
| docs/moduly-przyszlosci.md | Po MVP, przy planowaniu v2 |


## 11. PROMPTY DO ETAPÓW (w folderze prompts/)

Każdy etap ma osobny plik promptu. Wklejaj je do nowego okna AI:

| Plik | Etap | Kiedy użyć |
|------|------|-----------|
| `prompts/prompt-start.md` | Zawsze | Na początku KAŻDEJ sesji |
| `prompts/prompt-etap-00.md` | Etap 0 | Infrastruktura + setup |
| `prompts/prompt-etap-01.md` | Etap 1 | Design System + komponenty |
| `prompts/prompt-etap-02.md` | Etap 2 | Backend + Baza danych |
| `prompts/prompt-etap-03.md` | Etap 3 | Frontend Klienta |
| `prompts/prompt-etap-04.md` | Etap 4 | Dashboard Administratora |
| `prompts/prompt-etap-05.md` | Etap 5 | KDS + Drukarki |
| `prompts/prompt-etap-06.md` | Etap 6 | Płatności + Security |
| `prompts/prompt-etap-07.md` | Etap 7 | Deployment na RPi |
| `prompts/prompt-etap-08.md` | Etap 8 | Testy + Odbiór |

## 12. WORKFLOW (Jak Pracować z AI)

Szczegółowa instrukcja w `docs/workflow.md`:
- Jak rozpocząć nową sesję (krok po kroku)
- Jak zapisać stan pracy po sesji
- Jak kontynuować po przerwie
- Limity AI (25 kroków na turę) — jak nie przekroczyć
- Checklist przed każdą sesją

## 13. LICENCJE — Legalność Odsprzedaży

Szczegóły w `docs/licencje.md`:

✅ **Cały stack kodu jest 100% open-source** (MIT / Apache 2.0 / BSD) — można legalnie odsprzedać bez płacenia za licencje.

| Technologia | Licencja | Odsprzedaż |
|-------------|----------|------------|
| Next.js, React, TypeScript | MIT | ✅ Tak |
| Tailwind CSS, shadcn/ui | MIT | ✅ Tak |
| NestJS | MIT | ✅ Tak |
| Prisma ORM | Apache 2.0 | ✅ Tak |
| PostgreSQL | PostgreSQL License | ✅ Tak |
| Redis / Valkey | BSD / BSD | ✅ Tak |
| Socket.io | MIT | ✅ Tak |
| Docker, Nginx | Apache 2.0 / BSD | ✅ Tak |

Usługi zewnętrzne (Stripe, PayU, Google Maps) — klient płaci bezpośrednio dostawcom, nie ty.


---

Ostatnia aktualizacja: 2026-08-12
Wersja: 1.0
Status: Gotowe do implementacji (Etap 0)

# Restaurant Order System

> **Kompleksowy, nowoczesny system zamówień online dla restauracji z panelem zarządzania, systemem drukowania biletów wewnętrznych (kuchennych i dla kierowców) oraz zaawansowanymi mechanizmami konwersji sprzedażowej.**

---

## 🎯 Cel projektu

Stworzenie dedykowanej platformy e-commerce dla restauracji (pizzerii), działającej wyłącznie we własnym kanale sprzedażowym — bez pośrednictwa zewnętrznych agregatorów (pyszne.pl, Glovo, Uber Eats). System ma na celu maksymalizację wartości zamówienia (AOV) oraz konwersji użytkownika poprzez zastosowanie sprawdzonych wzorców psychologicznych i UX zaczerpniętych z globalnych liderów e-commerce (Amazon, Domino's, McDonald's App).

---

## 🏗️ Architektura wysokopoziomowa

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ UŻYTKOWNIK                                                                 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ Klient       │ │ Kuchnia      │ │ Kierowca     │ │ Administrator│        │
│ │ (Next.js)    │ │ (Dashboard)  │ │ (Dashboard)  │ │ (Dashboard)  │        │
│ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘        │
└─────────┼─────────────────┼─────────────────┼─────────────────┼───────────┘
          │                 │                 │                 │
          └─────────────────┴─────────────────┴─────────────────┘
                                    │
                    ┌─────────▼──────────┐
                    │ Nginx (Reverse     │
                    │ Proxy + SSL)       │
                    └─────────┬──────────┘
                              │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
    ┌──────▼──────┐          ┌──────▼──────┐          ┌──────▼──────┐
    │ Frontend    │          │ Backend     │          │ WebSocket   │
    │ (Next.js)   │◄────────►│ (NestJS)    │◄────────►│ (Socket.io) │
    │ :3000       │   API    │ :4000       │  Pub/Sub │    :4001    │
    └─────────────┘          └──────┬──────┘          └─────────────┘
                                    │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
    ┌──────▼──────┐         ┌──────▼──────┐         ┌──────▼──────┐
    │ PostgreSQL  │         │ Redis       │         │ Printer     │
    │ (menu,      │         │ (sessions,  │         │ Service     │
    │ orders)     │         │ cache)      │         │ (Node.js)   │
    │ :5432       │         │ :6379       │         │ :5000       │
    └─────────────┘         └─────────────┘         └──────┬──────┘
                                                           │
                                                    ┌──────▼──────┐
                                                    │ Thermal     │
                                                    │ Printers    │
                                                    │ (USB/NET)   │
                                                    └─────────────┘
```

---

## 🧰 Tech Stack

| Warstwa | Technologia | Uzasadnienie |
|---------|-------------|--------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui | SSR/SSG, optymalizacja SEO, szybkość ładowania, spójny design system |
| **Backend** | NestJS (Node.js), TypeScript | Architektura modułowa, Dependency Injection, gotowe rozwiązania do API i WebSocket |
| **Baza danych** | PostgreSQL 16 | Relacyjna baza idealna do zamówień, transakcji, menu z relacjami |
| **Cache & Queue** | Redis | Sesje, cache menu, kolejka zamówień dla drukarek |
| **Real-time** | Socket.io | Aktualizacje statusu zamówienia na żywo (kuchnia, klient, kierowca) |
| **Drukarki** | node-escpos + CUPS | Obsługa drukarek termicznych ESC/POS — **bilety wewnętrzne** (kuchenne i kierowcy). Paragon fiskalny wystawia osobna kasa fiskalna restauracji. |
| **Płatności** | Stripe / PayU | Bezpieczne płatności online, 3D Secure |
| **Konteneryzacja** | Docker + Docker Compose | Izolacja środowisk, łatwy deployment na Raspberry Pi 4 |
| **Reverse Proxy** | Nginx | SSL, load balancing, kompresja, cache statyczny |
| **CI/CD** | GitHub Actions | Automatyczne testy, build i deployment |
| **Monitoring** | Prometheus + Grafana (opcjonalnie Etap 7) | Metryki wydajności, logi, alerty |

> **Uwaga**: ROS drukuje wyłącznie **bilety wewnętrzne** (kuchenne i dla kierowców). Restauracja posiada osobną kasę fiskalną do wystawiania paragonów fiskalnych.

---

## 📁 Struktura repozytorium

```
restaurant-order-system/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Testy + build przy PR
│       └── deploy.yml          # Deployment na Raspberry Pi
├── apps/
│   ├── web/                    # Next.js - strona dla klientów
│   ├── dashboard/              # Next.js - panel admina/kuchni/kierowcy
│   ├── api/                    # NestJS - backend API
│   └── printer-service/        # Node.js - serwis drukarek termicznych
├── packages/
│   ├── shared-types/           # Wspólne typy TypeScript
│   ├── ui/                     # Wspólne komponenty shadcn/ui
│   └── config/                 # Wspólna konfiguracja ESLint, TS
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.prod.yml
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.dashboard
│   │   └── Dockerfile.printer
│   └── nginx/
│       ├── nginx.conf
│       └── ssl/                # Certyfikaty SSL (Let's Encrypt)
├── docs/                       # Dokumentacja projektu
└── README.md
```

---

## 🚀 Quick Start (lokalnie) — `start.sh`

Najprostszy sposób uruchomienia całego stacku:

```bash
# 1. Klonowanie repozytorium
git clone https://github.com/gamerpolska123-collab/WebowoROS
cd WebowoROS

# 2. Interaktywny start (konfiguracja + uruchomienie)
./start.sh
```

Skrypt `start.sh` automatycznie:
- ✅ Sprawdzi wymagane narzędzia (Docker, pnpm, Node.js)
- ✅ Zapyta o konfigurację (JWT_SECRET, CORS, Sentry, Plausible)
- ✅ Wygeneruje bezpieczny `JWT_SECRET` (jeśli nie podasz własnego)
- ✅ Utworzy pliki `.env` dla API, web i dashboard
- ✅ Zainstaluje zależności (`pnpm install`)
- ✅ Wygeneruje Prisma Client
- ✅ Uruchomi Docker Compose z całym stackem
- ✅ Poczeka na gotowość PostgreSQL, Redis i API

Aplikacje dostępne pod:
- **Strona klienta**: http://localhost:3000
- **Dashboard**: http://localhost:3001
- **API**: http://localhost:4000/v1
- **Swagger Docs**: http://localhost:4000/v1/docs
- **Prometheus Metrics**: http://localhost:4000/v1/metrics
- **WebSocket**: ws://localhost:4001

---

### Ręczny start (alternatywnie)

Jeśli wolisz kontrolować każdy krok:

```bash
# 1. Infrastruktura
docker-compose -f infra/docker/docker-compose.yml up -d

# 2. Zależności
pnpm install

# 3. Prisma
cd apps/api && pnpm db:generate && pnpm migrate:dev && pnpm db:seed

# 4. Dev serwery
pnpm dev
```

---

## 📖 Dokumentacja

Szczegółowa dokumentacja znajduje się w folderze [`docs/`](./docs/):

| Dokument | Opis |
|----------|------|
| [`docs/etapy.md`](./docs/etapy.md) | Szczegółowy plan etapowy (milestones, deliverables, kryteria akceptacji) |
| [`docs/architektura.md`](./docs/architektura.md) | Pełna architektura systemu, diagramy ERD, flow zamówienia |
| [`docs/ui-ux.md`](./docs/ui-ux.md) | Triki psychologiczne, design system, wzorce konwersji, CRO |
| [`docs/api.md`](./docs/api.md) | Specyfikacja REST API + WebSocket events |
| [`docs/docker.md`](./docs/docker.md) | Konfiguracja kontenerów, optymalizacja pod ARM64 (Raspberry Pi 4) |
| [`docs/hardware.md`](./docs/hardware.md) | Raspberry Pi 4, drukarki termiczne, sieć lokalna |
| [`docs/security.md`](./docs/security.md) | Bezpieczeństwo, płatności, GDPR, RODO |
| [`docs/setup.md`](./docs/setup.md) | Instrukcja instalacji krok po kroku (prod + dev) |
| [`docs/github-workflow.md`](./docs/github-workflow.md) | CI/CD, GitHub Actions, versioning |
| [`docs/licencje.md`](./docs/licencje.md) | Audyt licencji — legalność odsprzedaży |
| [`docs/malina-start.md`](./docs/malina-start.md) | Komendy krok po kroku na Raspberry Pi |
| [`docs/moduly-przyszlosci.md`](./docs/moduly-przyszlosci.md) | Roadmap v2 — moduły dodatkowe |
| [`docs/workflow.md`](./docs/workflow.md) | Jak pracować z AI — instrukcja dla użytkownika |

---

## 🖥️ Deployment na Raspberry Pi 4

System jest zoptymalizowany pod architekturę **ARM64** (Raspberry Pi 4, 4GB/8GB RAM):

- Obrazy Docker multi-arch (buildx)
- Nginx jako reverse proxy z Let's Encrypt
- Automatyczne backupy bazy danych (cron + rsync)
- Watchtower do automatycznych aktualizacji kontenerów
- Fail2ban dla bezpieczeństwa SSH/Nginx

Szczegóły w [`docs/hardware.md`](./docs/hardware.md) i [`docs/docker.md`](./docs/docker.md).

---

## 🔒 Bezpieczeństwo i zgodność

- **SSL/TLS** (Let's Encrypt) - wymuszony HTTPS
- **JWT + HttpOnly cookies** - autentykacja bez podatności na XSS
- **Rate Limiting** - ochrona przed brute-force i scrapingiem
- **GDPR/RODO** - polityka prywatności, cookies, prawo do zapomnienia
- **PCI DSS** - płatności przez zewnętrzny provider (Stripe/PayU), bez przechowywania danych kart

---

## ⚖️ Licencje i Prawo do Odsprzedaży

System został zbudowany **wyłącznie na technologiach open-source z licencjami permissive** (MIT, Apache 2.0, BSD), co oznacza:

- ✅ **Możesz odsprzedać system** — bez płacenia komukolwiek za licencję
- ✅ **Nie musisz ujawniać kodu źródłowego** — brak copyleft (GPL/AGPL/SSPL)
- ✅ **Nie płacisz royalty** — jednorazowa cena za system

**Szczegółowy audyt licencyjny** znajduje się w [`docs/licencje.md`](./docs/licencje.md).

> ⚠️ **Jedyny koszt operacyjny** dla restauracji to prowizja od płatności (Stripe/PayU — ~1.5-2.5% od transakcji), co jest standardem w branży i nie wpływa na prawo własności do systemu.

---

## 📞 Kontakt i wsparcie

Projekt realizowany etapowo. Każdy etap kończy się prezentacją deliverables i akceptacją.

---

*Projekt poufny. Wszelkie dane identyfikujące restaurację (nazwa, adres, logo) zostaną wdrożone w finalnej fazie implementacji.*

*README v1.1 — 2026-08-13*
*Zmiany: doprecyzowanie roli drukarek (bilety wewnętrzne, nie paragony fiskalne), aktualizacja listy dokumentacji.*

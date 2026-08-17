# 🤖 PROMPT — Kontynuacja pracy nad WebowoROS

## KIM JESTEŚ
Jesteś kontynuatorem pracy nad projektem **WebowoROS** (Restaurant Order System) — kompletnym systemem zamówień online dla pizzerii działającym bez agregatorów (pyszne.pl, Glovo, Uber Eats).

## REPOZYTORIUM
- Lokalizacja: `/mnt/agents/output/WebowoROS`
- **ZACZNIJ OD PRZEANALIZOWANIA REPO** — przeczytaj `docs/handoff-current.md`, `README-AI.md`, `docs/etapy.md`
- Wszystko działa w Docker — host nie potrzebuje Node.js/npm

## ARCHITEKTURA
| Serwis | Tech | Port | Opis |
|--------|------|------|------|
| web | Next.js 14 App Router | 3000 | Strona klienta (menu, torba, checkout, tracking) |
| dashboard | Next.js 14 App Router | 3001 | Panel admina, KDS (kitchen display), zarządzanie produktami |
| api | NestJS + Prisma + PostgreSQL | 4000 + WS 4001 | Backend API, WebSocket Gateway, auth JWT |
| printer-service | Node.js + Redis | 5000 | Drukarki ESC/POS (bilety kuchenne i kierowcy) |
| postgres | PostgreSQL 16 | 5432 | Baza danych |
| redis | Redis 7 | 6379 | Cache, pub/sub, queue |
| nginx | Nginx | 80/443 | Reverse proxy, SSL, rate limiting |

## CO JEST GOTOWE (Etap 0-4)
- ✅ API: auth JWT+refresh, RBAC 5 ról, menu, orders (z upsellem), admin CRUD, payments (symulacja), WebSocket, health, metrics, upload
- ✅ WEB: strona główna, torba, checkout 3-krokowy, menu, track order, PWA (SW, manifest)
- ✅ DASHBOARD: login, KDS, orders management, products CRUD, stats
- ✅ PRINTER-SERVICE: drukarki ESC/POS
- ✅ UI Package: 25 komponentów (PizzaBag, FlyToBag, UpsellModal, BundleBuilder, etc.)
- ✅ Prisma: 16 modeli, 9 enumów, seed + seed-upsell
- ✅ Docker: Dockerfile.dev + 4x prod, docker-compose.yml + prod + swarm, nginx.conf
- ✅ Faza 1 poprawki KOMPLETNA (21 poprawek): importy, eksporty, TTL parser, Prisma transaction, JWT Bearer, logout guard, Dockerfile.dev, docker-compose.yml, animations.css, db:migrate, db:studio, transpilePackages, paths, Order type, skrypty npm, pnpm cleanup

## CO TRZEBA ZROBIĆ (PRIORYTET)

### Faza 1 — DOKOŃCZENIE (blokujące uruchomienie):
1. **[KRYTYCZNE]** Wygeneruj pełny `package-lock.json`:
   ```bash
   cd /mnt/agents/output/WebowoROS
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps --no-audit --no-fund
   ```
   Jeśli błąd — napraw konflikty peer deps (dokumentacja w `docs/handoff-current.md`)

2. **[KRYTYCZNE]** Przetestuj build Docker:
   ```bash
   cd infra/docker
   docker compose up -d --build
   ```
   - Jeśli błąd przy npm install w kontenerze — sprawdź czy wszystkie package.json są poprawne
   - Jeśli błąd przy build — napraw kompilację (brakujące typy, importy)

3. **[KRYTYCZNE]** Przetestuj endpointy API (curl/HTTPie):
   ```bash
   curl http://localhost:4000/v1/health
   curl http://localhost:4000/v1/auth/csrf
   ```

### Faza 2 — BEZPIECZEŃSTWO (przed publicznym dostępem):
4. Dodaj autentykację do WebSocket Gateway (`handleConnection` — weryfikacja JWT tokena z query param lub cookie)
5. Zamień `Math.random()` na sekwencję PostgreSQL dla `orderNumber` w `orders.service.ts`
6. Dodaj Origin/Referer check do CSRF Guard
7. Dodaj walidację `minOrderValue` z `SiteConfig` w `createOrder`
8. Popraw kolejność APP_GUARD w `app.module.ts` — Throttler powinien być pierwszy (najszybszy fail)

### Faza 3 — FUNKCJONALNOŚĆ (Etap 5-8):
9. Dokończ KDS (Kitchen Display System) — aktualizacje real-time, zarządzanie czasem przygotowania
10. Dodaj management dostawców (przypisywanie zamówień, śledzenie GPS)
11. Zaimplementuj prawdziwe płatności Stripe/PayU (obecnie tylko `simulatePayment`)
12. Dodaj testy E2E (Playwright)
13. Dodaj CI/CD pipeline (GitHub Actions)

## WAŻNE ZASADY
- **Pracuj POWOLI ale DOKŁADNIE** — projekt ma być zaawansowany, nie byle szybki
- **Wszystko w kontenerach Docker** — host nie potrzebuje Node.js ani npm
- **Nie pokazuj całego kodu** — podsumowuj co zrobiłeś
- **Commituj często** (`git add . && git commit -m "..."`)
- **Testuj na bieżąco** — każda zmiana musi być zweryfikowana
- **Nie wklejaj sekretów** (hasła, klucze API)
- **Zachowaj spójność** z istniejącą architekturą
- Jeśli coś jest niejasne — przeczytaj `docs/` zamiast zgadywać

## START
```bash
cd /mnt/agents/output/WebowoROS
docker --version && docker compose version
ls -la && ls apps/ && ls packages/
cat package.json | grep -A5 '"workspaces"'
cat infra/docker/Dockerfile.dev
cat infra/docker/docker-compose.yml
```

Potem:
1. `npm install` (jeśli nie ma package-lock.json)
2. `cd infra/docker && docker compose up -d --build`
3. Testuj endpointy
4. Raportuj co działa, a co wymaga naprawy

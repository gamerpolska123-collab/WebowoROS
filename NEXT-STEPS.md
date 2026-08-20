# 🎯 NEXT-STEPS.md — WebowoROS v2.1
## Priorytetowa lista zadań (ZWERYFIKOWANA 2026-08-17)

---

## ✅ CO ZOSTAŁO NAPRAWIONE

### Sesja naprawcza (2026-08-17)
- ✅ `.env` usunięty z repo
- ✅ `ts-node` → `tsx` w seed (fix ESM error)
- ✅ `isDeleted` dodany do Prisma schema + index
- ✅ `admin.service.ts` — `deleteProduct` używa `isDeleted: true`
- ✅ `orders.service.ts` — enumy zamiast stringów w `cancelOrder`
- ✅ `orders.service.ts` — `updateStatus` naprawiony (transaction, changedBy, include)
- ✅ `lucide-react` ujednolicony do `^0.427.0`
- ✅ `.github/workflows/ci.yml` i `cd.yml` dodane
- ✅ Error handler w `docker-compose.yml` — API startuje nawet bez seed

---

## 🎯 CO TRZEBA ZROBIĆ

### PRIORYTET 0: Konteneryzacja ✅ (ZROBIONE)
- [x] **Wszystko w kontenerach** — Dockerfile.dev, docker-compose.yml, start.sh
- [x] **Playwright w kontenerze** — docker-compose.test.yml, ./start.sh e2e
- [x] **node_modules izolacja** — named volumes, .dockerignore
- [x] **Brak lokalnych komend** — wszystko przez `./start.sh`

### PRIORYTET 1: Infrastruktura (1 sesja)
- [ ] **Regeneracja sekretów** — zmień wszystkie klucze w `.env` przed produkcją
- [ ] **Wyczyść historię gita** — jeśli `.env` był commitowany, użyj BFG Repo-Cleaner
- [ ] **Wygeneruj `package-lock.json`** — `npm install` w root
- [ ] **Przetestuj build** — `./start.sh dev` i sprawdź czy wszystko działa

### PRIORYTET 2: Płatności (2-3 sesje)
- [ ] Stripe integration (Elements, webhook, 3D Secure)
- [ ] PayU BLIK integration
- [ ] Refund handling
- [ ] Payment status sync w orders

### PRIORYTET 3: Testy i Optymalizacja (2 sesje)
- [x] Playwright config + sample tests ✅ (pełne E2E w przyszłości)
- [ ] Lighthouse audit (performance, accessibility, SEO)
- [x] PWA headers w `next.config.js` ✅ (next-pwa w przyszłości)
- [x] Dynamiczny `sitemap.xml` (Next.js App Router route handler) ✅
- [x] Sentry.init w `layout.tsx` web i dashboard ✅

### PRIORYTET 4: Funkcjonalność (2 sesje)
- [x] `BundleConfig` w seed ✅
- [x] Drag & drop reorder kategorii (dnd-kit) ✅
- [ ] Inline price editor + WS broadcast
- [ ] SalesReport (Recharts: daily/weekly/monthly)
- [ ] AOVReport, UpsellConversion

---

## 🚀 Szybki start (po wypakowaniu ZIP)

```bash
# 1. Skopiuj env
cp .env.example .env
# EDYTUJ .env — zmień wszystkie sekrety!

# 2. Zainstaluj zależności
npm install

# 3. Start dev
./start.sh dev

# 4. Logi
./start.sh logs
```

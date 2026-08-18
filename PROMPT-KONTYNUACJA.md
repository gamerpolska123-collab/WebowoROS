# PROMPT-KONTYNUACJA.md
## Instrukcja dla następnej sesji AI — WebowoROS

> **ZASADA #1**: Przed każdą zmianą przeczytaj `AUDYT-STATUS.md` — to jedyny wiarygodny dokument stanu.
> **ZASADA #2**: Nie ufaj README-AI.md, AUDYT.md, PODSUMOWANIE-AUDYTU.md — zawierają fałszywe stwierdzenia.
> **ZASADA #3**: Pracuj powoli i dokładnie. Sprawdzaj co już jest zrobione. Nie na skróty.
> **ZASADA #4**: Kod, zmienne, komentarze, nazwy plików: ANGIELSKI. Dokumentacja UI: POLSKI.
> **ZASADA #5**: Nie pokazuj kodu w odpowiedziach (chyba że użytkownik prosi). Opisuj zmiany.

---

## KONTEKST

Projekt: **WebowoROS** — system zamówień online dla pizzerii.
Stack: Next.js 14 + NestJS + PostgreSQL 16 + Redis 7 + Socket.io + Prisma + Tailwind + Turborepo + Docker.

Repozytorium zostało pobrane z GitHub i spakowane do tego ZIP-a. Root `package.json` został dodany w tym ZIP-ie (wcześniej nie istniał). Plik `.env` został usunięty — użyj `.env.example`.

---

## CO ZOSTAŁO ZROBIONE (poprzednia sesja)

1. Pobrano całe repo z GitHub.
2. Przeanalizowano ~85% kodu źródłowego.
3. Wykonano pełny audyt — wykryto 7 problemów krytycznych, 24 wysokich, 12 średnich.
4. Dodano root `package.json` z workspaces i turbo.
5. Usunięto `.env` z pakietu (wrażliwe dane).
6. Utworzono `AUDYT-STATUS.md` — jedyny wiarygodny dokument stanu.
7. Utworzono ten plik (`PROMPT-KONTYNUACJA.md`).

---

## CO TRZEBA ZROBIĆ — PRIORYTETY

### FAZA 1: KRYTYCZNE (blokujące budowę / bezpieczeństwo)

1. **Włączyć strict mode w API** — `apps/api/tsconfig.json`: `strict: true`, `strictNullChecks: true`, `noImplicitAny: true`, `strictBindCallApply: true`, `forceConsistentCasingInFileNames: true`, `noFallthroughCasesInSwitch: true`. Naprawić wszystkie błędy typowania.
2. **Naprawić `product-card`** — dodać brakujący import `Image` z `next/image` w `packages/ui/src/components/product-card.tsx`.
3. **Naprawić `dashApi.getSalesReport`** — albo dodać metodę do `apps/dashboard/lib/api.ts`, albo usunąć `useSalesReport` z `apps/dashboard/lib/hooks.ts`.
4. **Wygenerować `package-lock.json`** — uruchomić `npm install` w root.
5. **Utworzyć `.github/workflows/ci.yml`** — testy, lint, build przy PR.

### FAZA 2: WYSOKIE (funkcjonalne)

6. **Ujednolicić WebSocket** — albo wszędzie socket.io, albo wszędzie native WS.
7. **Wyodrębnić mapy statusów** do `packages/shared-types` i zaimportować we wszystkich komponentach dashboardu.
8. **Zdefiniować CSS variables** w `globals.css` web i dashboard LUB zmienić klasy w komponentach UI na konkretne kolory z tailwind.config.
9. **Dodać obsługę wariantów i addonów** do formularza produktu w dashboardzie.
10. **Zaimplementować pełną integrację checkout** z API (tworzenie zamówienia, płatności).
11. **Dodać sync koszyka z API** dla zalogowanych użytkowników.
12. **Dodać endpoint `POST /orders/:id/cancel`** dla klienta.
13. **Zaimplementować `OrderStatusHistory`** w Prisma schema i orders.service.
14. **Dodać emisję WS eventów** w orders.service (order:updated, kitchen:new).
15. **Naprawić `fetchWithRetry`** w dashboard hooks (przenieść pod `"use client"`).
16. **Dodać obsługę 401/403** w `dashApi` z redirectem do `/login`.
17. **Zastąpić `alert()`/`confirm()`** toastami i modalami.

### FAZA 3: ŚREDNIE / DOKUMENTACJA

18. Skonsolidować dokumentację — usunąć duplikaty, zostawić jedno źródło prawdy.
19. Naprawić README-AI.md — usunąć fałszywe stwierdzenia.
20. Skonfigurować Nginx (gzip, cache, SSL).
21. Dodać healthchecki i restart policies do docker-compose.
22. Naprawić polską odmianę w `PizzaBag`.
23. Zamienić `<img>` na `<Image>` w komponentach UI.

### FAZA 4: WERYFIKACJA (nieprzeczytane)

24. Przeczytać i zweryfikować `infra/docker/*` (Dockerfile, compose files).
25. Przeczytać i zweryfikować `infra/nginx/nginx.conf`.
26. Przeczytać i zweryfikować `apps/printer-service/src/index.ts`.
27. Przeczytać i zweryfikować `e2e/*` (Playwright tests).
28. Przeczytać i zweryfikować `packages/config/*`.
29. Przeczytać i zweryfikować `apps/web/middleware.ts`.
30. Przeczytać i zweryfikować `apps/web/app/track/[orderId]/page.tsx`.
31. Przeczytać i zweryfikować `apps/web/lib/cart-context.tsx` (warianty, addony).

---

## ZASADY KODOWANIA (MUSI BYĆ PRZESTRZEGANE)

- TypeScript strict mode włączony.
- Brak `any` — używaj `unknown` + type guards.
- Wszystkie funkcje muszą mieć zdefiniowane return types.
- Interfejsy w `packages/shared-types`.
- JWT w HttpOnly cookies (nie localStorage).
- Walidacja Zod na wszystkich endpointach.
- Rate limiting (już jest @Throttle).
- Nie commituj `.env`!
- Commity: Conventional Commits po angielsku.

---

## UWAGI TECHNICZNE

- Wszystkie skrypty uruchamiaj w kontenerze: `docker compose exec <service> npm run <script>`.
- Frontendy NIE używają `localhost` — używają nazw serwisów (`api:4000`, `redis:6379`).
- ROS drukuje wyłącznie bilety wewnętrzne (kuchenne i dla kierowców). Paragon fiskalny wystawia osobna kasa fiskalna.
- System nie posiada modułu magazynowego — dostępność produktów jest zarządzana ręcznie.

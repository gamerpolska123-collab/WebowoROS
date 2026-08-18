# PLAN-NAPRAW.md
## Plan napraw WebowoROS — priorytetowy

> Ten dokument zawiera konkretny, krok-po-kroku plan napraw. Wykonuj w kolejności — nie pomijaj faz.

---

## FAZA 1: KRYTYCZNE (blokujące budowę / bezpieczeństwo / działanie)

### K1. Włączyć strict mode w API
**Plik:** `apps/api/tsconfig.json`
**Zmiany:**
- `strict: true`
- `strictNullChecks: true`
- `noImplicitAny: true`
- `strictBindCallApply: true`
- `forceConsistentCasingInFileNames: true`
- `noFallthroughCasesInSwitch: true`

**Potem:** Uruchomić `npm run typecheck` w `apps/api` i naprawić WSZYSTKIE błędy typowania.

### K2. Naprawić `product-card`
**Plik:** `packages/ui/src/components/product-card.tsx`
**Zmiana:** Dodać `import Image from "next/image";` na górze pliku.

### K3. Naprawić `dashApi.getSalesReport`
**Opcja A:** Dodać do `apps/dashboard/lib/api.ts`:
```ts
getSalesReport: (period: string, days: number) =>
  fetchApi<any>(`/admin/reports/sales?period=${period}&days=${days}`),
```
**Opcja B:** Usunąć `useSalesReport` z `apps/dashboard/lib/hooks.ts` i zastąpić w `apps/dashboard/app/reports/components/sales-report.tsx` mock data lub placeholder.

### K4. Wygenerować `package-lock.json`
**Komenda:** `npm install` w root monorepo.

### K5. Utworzyć `.github/workflows/ci.yml`
**Wymagania:**
- Instalacja zależności (`npm ci`)
- Lint wszystkich pakietów
- Typecheck wszystkich pakietów
- Build wszystkich aplikacji
- Testy jednostkowe
- Testy E2E (Playwright)

---

## FAZA 2: WYSOKIE (funkcjonalne / architektoniczne)

### W1. Ujednolicić WebSocket
**Decyzja:** Użyć socket.io-client wszędzie (bardziej niezawodne niż native WS).
**Pliki do zmiany:**
- `apps/dashboard/app/kds/page.tsx` — zamienić `new WebSocket()` na `io()` z socket.io-client.
- `apps/dashboard/lib/use-orders-ws.ts` — już używa socket.io, wymaga weryfikacji czy działa poprawnie z KDS.

### W2. Wyodrębnić mapy statusów
**Nowy plik:** `packages/shared-types/src/order-status.ts`
**Zawartość:**
- `OrderStatus` enum (już istnieje w index.ts)
- `STATUS_LABELS_PL: Record<OrderStatus, string>`
- `STATUS_COLORS: Record<OrderStatus, string>`
- `STATUS_FLOW: OrderStatus[]` — dozwolone przejścia statusów
- `NEXT_STATUS_MAP: Record<OrderStatus, OrderStatus | null>`

**Pliki do aktualizacji:**
- `apps/dashboard/app/orders/components/orders-table.tsx`
- `apps/dashboard/app/orders/components/order-detail-modal.tsx`
- `apps/dashboard/app/orders/components/order-filters.tsx`
- `apps/dashboard/app/kds/page.tsx`
- `apps/api/src/orders/orders.controller.ts` (walidacja dozwolonych przejść)

### W3. Zdefiniować CSS variables
**Opcja A (zalecana):** Dodać do `apps/web/app/globals.css` i `apps/dashboard/app/globals.css`:
```css
:root {
  --primary: #E63946;
  --primary-foreground: #FFFFFF;
  --destructive: #D62828;
  --destructive-foreground: #FFFFFF;
  --accent: #2A9D8F;
  --accent-foreground: #FFFFFF;
  --background: #FFFFFF;
  --foreground: #111827;
  --ring: #E63946;
}
```

**Opcja B:** Zmienić klasy w komponentach UI na konkretne kolory z tailwind.config (np. `bg-[#E63946]` zamiast `bg-primary`).

### W4. Dodać warianty i addony do formularza produktu
**Plik:** `apps/dashboard/app/products/components/product-form-modal.tsx`
**Dodać sekcje:**
- Zarządzanie wariantami (nazwa, priceAdjustment, isActive)
- Zarządzanie addonami (nazwa, price, maxQuantity, isActive)
- Zarządzanie badge'ami

**Backend:** Zweryfikować czy `admin.controller.ts` i `admin.service.ts` obsługują te relacje w Prisma.

### W5. Zaimplementować pełną integrację checkout
**Plik:** `apps/web/app/checkout/page.tsx`
**Zmiany:**
- Użyć `useCreateOrder` hooka do wysyłania zamówienia do API.
- Po sukcesie redirect do `/track/{orderId}`.
- Obsługa płatności: redirect do Stripe/PayU lub symulacja w dev.

### W6. Sync koszyka z API
**Plik:** `apps/web/lib/cart-context.tsx`
**Dodać:**
- Po zalogowaniu: fetch koszyka z API i merge z localStorage.
- Przy zmianie koszyka (dodaj/usuń): sync do API (dla zalogowanych).
- Przy wylogowaniu: zapisz localStorage.

### W7. Endpoint anulowania dla klienta
**Plik:** `apps/api/src/orders/orders.controller.ts`
**Dodać:**
```ts
@Post(':id/cancel')
@UseGuards(JwtAuthGuard)
async cancelOrder(@Param('id') id: string, @CurrentUser() user: User) {
  return this.ordersService.cancelOrder(id, user.id);
}
```

**Plik:** `apps/api/src/orders/orders.service.ts`
**Dodać metodę:** Sprawdź czy zamówienie należy do użytkownika i status pozwala na anulowanie (np. tylko `pending_payment`, `paid`, `confirmed`).

### W8. OrderStatusHistory
**Plik:** `apps/api/prisma/schema.prisma`
**Dodać model:**
```prisma
model OrderStatusHistory {
  id        String   @id @default(uuid())
  orderId   String
  status    OrderStatus
  note      String?
  changedBy String?
  createdAt DateTime @default(now())
  order     Order    @relation(fields: [orderId], references: [id])
}
```

**Plik:** `apps/api/src/orders/orders.service.ts`
**Dodać:** Przy każdej zmianie statusu tworzyć rekord w OrderStatusHistory.

### W9. Emisja WS w orders.service
**Plik:** `apps/api/src/orders/orders.service.ts`
**Dodać:** Inject `OrdersGateway` i emitować eventy:
- `order:updated` do room `order:{orderId}`
- `kitchen:new` do room `kitchen` (dla nowych zamówień)
- `orders:new` (dla dashboardu)

### W10. Naprawić fetchWithRetry
**Plik:** `apps/dashboard/lib/hooks.ts`
**Zmiana:** Przenieść definicję `fetchWithRetry` POD dyrektywę `"use client"`.

### W11. Obsługa 401/403 w dashApi
**Plik:** `apps/dashboard/lib/api.ts`
**Zmiana:** W `fetchApi`, przy statusie 401/403 — wyczyścić cookies i redirect do `/login`.

### W12. Zastąpić alert()/confirm()
**Pliki:** ~10 miejsc w dashboardzie i web.
**Zmiana:** Użyć `useToast` z `@ros/ui` lub stworzyć custom modale.

---

## FAZA 3: ŚREDNIE / DOKUMENTACJA

### S1. Skonsolidować dokumentację
- Usunąć: `AUDYT.md`, `AUDYT-README.md`, `PODSUMOWANIE-AUDYTU.md` (zawierają fałszywe info).
- Zostawić: `README.md`, `AUDYT-STATUS.md`, `PROMPT-KONTYNUACJA.md`, `PLAN-NAPRAW.md`, `SECURITY.md`.
- Zaktualizować: `README-AI.md` — usunąć fałszywe "✅ naprawiono".

### S2. Nginx
**Plik:** `infra/nginx/nginx.conf`
**Dodać:** gzip, cache statyczny, SSL (w prod).

### S3. Docker-compose
**Plik:** `infra/docker/docker-compose.yml`
**Dodać:** healthchecki, restart policies (`unless-stopped`).

### S4. PizzaBag polska odmiana
**Plik:** `packages/ui/src/components/pizza-bag.tsx`
**Zmiana:**
```tsx
const itemLabel = (n: number) => {
  if (n === 1) return 'produkt';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'produkty';
  return 'produktów';
};
```

### S5. Zamienić `<img>` na `<Image>`
**Pliki:**
- `packages/ui/src/components/fly-to-bag.tsx`
- `packages/ui/src/components/upsell-modal.tsx`
- `packages/ui/src/components/pizza-bag.tsx` (wewnętrznie)
- `apps/dashboard/app/categories/components/sortable-category-list.tsx`
- `apps/dashboard/app/products/components/product-card.tsx`

**Uwaga:** `Image` z next/image wymaga `width` i `height` lub `fill`.

---

## FAZA 4: WERYFIKACJA

### V1. infra/docker/*
Przeczytać wszystkie Dockerfile i compose. Sprawdzić:
- Czy wszystkie serwisy mają poprawne CMD/ENTRYPOINT
- Czy wieloetapowe buildy są optymalne
- Czy .dockerignore jest wystarczający

### V2. infra/nginx/nginx.conf
Sprawdzić:
- gzip
- cache headers
- SSL config (w prod)
- upstream proxy_pass
- WebSocket upgrade headers

### V3. apps/printer-service/src/index.ts
Sprawdzić:
- Czy poprawnie łączy się z Redis
- Czy obsługuje drukarki USB i sieciowe
- Czy format biletu jest poprawny (ESC/POS)
- Czy ma retry logic przy błędzie drukarki

### V4. e2e/*
Sprawdzić:
- Czy testy Playwright są kompletne
- Czy pokrywają krytyczne ścieżki (rejestracja, login, zamówienie, płatność, KDS)

### V5. packages/config/*
Sprawdzić:
- Czy eslint.config.js jest poprawny
- Czy prettier.config.js jest spójny
- Czy tsconfig.base.json ma `strict: true`

### V6. apps/web/middleware.ts
Sprawdzić czy istnieje i co robi.

### V7. apps/web/app/track/[orderId]/page.tsx
Sprawdzić czy poprawnie fetchuje status zamówienia i obsługuje WS.

### V8. apps/web/lib/cart-context.tsx
Sprawdzić czy obsługuje warianty produktów i dodatki (addony).

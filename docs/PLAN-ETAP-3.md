# 📘 PLAN IMPLEMENTACJI — ETAP 3: Frontend Web
## Szczegółowy przewodnik dla następnej sesji AI

**Cel:** Podłączyć frontend do real API i zaimplementować pełny flow zamówienia.
**Szacowany czas:** 3-4 sesje AI
**Zależności:** Backend (Etap 2) musi być uruchomiony i dostępny pod `http://localhost:4000`

---

## 🗺 ARCHITEKTURA FRONTENDU

```
apps/web/
├── app/
│   ├── page.tsx              # Strona główna (hero + featured + categories)
│   ├── menu/
│   │   └── page.tsx          # Pełne menu z kategoriami
│   ├── bag/
│   │   └── page.tsx          # Torba (guest + logged in)
│   ├── checkout/
│   │   └── page.tsx          # Checkout 3-krokowy
│   ├── track/
│   │   └── page.tsx          # Lista zamówień (dla zalogowanych)
│   │   └── [orderId]/
│   │       └── page.tsx      # Szczegóły zamówienia + real-time
│   ├── login/
│   │   └── page.tsx          # Logowanie (opcjonalne — guest checkout)
│   ├── privacy/
│   │   └── page.tsx          # Polityka prywatności
│   ├── terms/
│   │   └── page.tsx          # Regulamin
│   ├── loading.tsx           # Skeleton loader (globalny)
│   ├── not-found.tsx         # 404 page
│   ├── error.tsx             # Error boundary
│   └── layout.tsx            # Root layout (CartProvider, PWA, analytics)
├── lib/
│   ├── api.ts                # Axios instance + interceptors
│   ├── cart-context.tsx      # Cart state (localStorage + API sync)
│   ├── hooks.ts              # React Query hooks (useMenu, useOrder, etc.)
│   ├── use-create-order.ts   # Mutation: tworzenie zamówienia
│   └── auth-context.tsx      # (NOWY) Auth state (JWT, user, login, logout)
├── components/
│   ├── product-card.tsx      # (w packages/ui) — już gotowy
│   ├── pizza-builder.tsx     # (w packages/ui) — wymaga API integration
│   └── ...                   # Inne komponenty
└── public/
    ├── manifest.json         # PWA manifest
    ├── sw.js                 # Service Worker (wymaga implementacji)
    ├── robots.txt            # ✅ Dodane
    ├── sitemap.xml           # ✅ Dodane
    └── humans.txt            # ✅ Dodane
```

---

## 📡 INTEGRACJA API — ENDPOINTY

### Publiczne (bez auth)
| Endpoint | Metoda | Opis | Hook |
|----------|--------|------|------|
| `/menu` | GET | Pełne menu z kategoriami i produktami | `useMenu()` |
| `/menu/categories` | GET | Tylko kategorie | `useCategories()` |
| `/menu/products` | GET | Produkty z filtrami | `useProducts()` |
| `/menu/products/:slug` | GET | Szczegóły produktu | `useProduct(slug)` |

### Wymagające auth (JWT w cookie lub header)
| Endpoint | Metoda | Opis | Hook |
|----------|--------|------|------|
| `/auth/me` | GET | Dane zalogowanego użytkownika | `useMe()` |
| `/orders` | POST | Tworzenie zamówienia | `useCreateOrder()` |
| `/orders` | GET | Lista zamówień użytkownika | `useOrders()` |
| `/orders/:id` | GET | Szczegóły zamówienia | `useOrder(id)` |
| `/orders/:id/cancel` | PATCH | Anulowanie zamówienia | `useCancelOrder()` |

### WebSocket
| Event | Kierunek | Opis |
|-------|----------|------|
| `join_order` | Client → Server | Subskrypcja statusu zamówienia |
| `order_status_updated` | Server → Client | Zmiana statusu zamówienia |
| `kitchen:new` | Server → Client | Nowe zamówienie (dla KDS) |

**WAŻNE:** WebSocket teraz wymaga JWT token w `auth` podczas connect:
```typescript
const ws = new WebSocket(wsUrl);
ws.onopen = () => {
  ws.send(JSON.stringify({ event: "auth", data: { token: jwtToken } }));
};
```

---

## 🛒 FLOW ZAMÓWIENIA — KROK PO KROKU

### 1. Przeglądanie menu
```
User → / lub /menu
  → SSR/ISR: fetch /menu (revalidate 60s)
  → ProductCard z real data (zdjęcia z API lub placeholder)
  → Klik "Dodaj" → PizzaBuilder (jeśli produkt ma variants/addons)
    → Fetch variants i addons z API (lub z danych z /menu)
    → Wybór wariantu + dodatków
    → Klik "Dodaj do torby"
      → Fly-to-bag animation
      → CartContext.addItem()
      → localStorage.setItem('cart', JSON.stringify(cart))
      → Jeśli zalogowany: POST /cart/sync
```

### 2. Torba (Bag)
```
User → /bag
  → CartContext odczytuje z localStorage
  → Jeśli zalogowany: sync z API (GET /cart)
  → Wyświetlenie pozycji, ilości, cen
  → Możliwość: zmiana ilości, usuwanie, dodanie kodu rabatowego (v2)
  → Klik "Zamów" → /checkout
```

### 3. Checkout
```
User → /checkout
  → Krok 1: Dane dostawy (delivery/pickup)
    → Walidacja: imię, nazwisko, telefon (+48), email, adres
    → Jeśli zalogowany: prefill z /auth/me
  → Krok 2: Metoda płatności
    → Karta (Stripe Elements)
    → BLIK (PayU)
    → Gotówka przy odbiorze
  → Krok 3: Podsumowanie
    → Lista pozycji, ceny, dostawa, razem
    → Checkbox: akceptacja regulaminu
    → Klik "Złóż zamówienie"
      → POST /orders z idempotencyKey (uuid v4)
      → Response: { orderId, status, paymentUrl? }
      → Redirect: /track/{orderId}
```

### 4. Śledzenie zamówienia
```
User → /track/{orderId}
  → GET /orders/{orderId} (poll co 10s fallback)
  → WebSocket: join_order → real-time updates
  → Timeline: Złożone → Potwierdzone → W przygotowaniu → Gotowe → W drodze → Dostarczone
  → Estimated time: based on status + queue length (v2)
```

---

## 🧪 TESTY — CO TRZEBA ZAIMPLEMENTOWAĆ

### Jest + React Testing Library
```
apps/web/
├── __tests__/
│   ├── components/
│   │   ├── product-card.test.tsx
│   │   ├── pizza-builder.test.tsx
│   │   └── cart-context.test.tsx
│   ├── pages/
│   │   ├── page.test.tsx
│   │   ├── bag.test.tsx
│   │   └── checkout.test.tsx
│   └── hooks/
│       ├── use-menu.test.ts
│       └── use-create-order.test.ts
```

### Playwright E2E
```
e2e/
├── menu.spec.ts          # Przeglądanie menu, dodawanie do torby
├── checkout.spec.ts      # Full checkout flow
├── auth.spec.ts          # Logowanie, rejestracja
└── track.spec.ts         # Śledzenie zamówienia
```

---

## 🎨 UX/UI — WYMAGANIA

### Animacje (MUSZĄ być zachowane)
- **Fly-to-bag** — produkt "leci" do torby (CSS transform + keyframes)
- **Confetti** — po osiągnięciu progu darmowej dostawy (canvas-confetti)
- **Shake** — torba drży gdy próbujesz zamówić poniżej minimum (CSS keyframes)
- **Progress bar** — animowane wypełnianie przy darmowej dostawie

### Mobile-first
- Wszystkie strony muszą działać na 320px+
- Touch-friendly buttons (min 44x44px)
- Bottom sheet dla PizzaBuilder na mobile

### Performance
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Time to Interactive < 3.5s
- CLS < 0.1

---

## 🔧 KONFIGURACJA ŚRODOWISKA

### .env.local (dla developmentu)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_PAYU_POS_ID=...
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=localhost
```

### next.config.js
```javascript
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'cdn.weboworos.pl'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};
```

---

## 📋 CHECKLISTA ETAPU 3

- [ ] Strona główna podłączona do API (ISR)
- [ ] Menu z kategoriami i produktami (real data)
- [ ] PizzaBuilder z real variants/addons
- [ ] Torba — guest (localStorage) + logged (API sync)
- [ ] Checkout 3-krokowy z walidacją Zod
- [ ] Płatność: Stripe, PayU, Cash on delivery
- [ ] Śledzenie zamówienia z WebSocket
- [ ] PWA: manifest, sw.js, offline page
- [ ] SEO: meta tags, Open Graph, sitemap, robots
- [ ] Testy: Jest + React Testing Library
- [ ] E2E: Playwright (minimum 3 scenariusze)
- [ ] Lighthouse: 90+ we wszystkich kategoriach

---

*Ten plan został wygenerowany podczas sesji audytowej. Następna sesja AI powinna zacząć od podpunktu "Strona główna podłączona do API" i systematycznie przechodzić przez checklistę.*

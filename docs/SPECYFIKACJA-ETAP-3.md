# 📘 SPECYFIKACJA IMPLEMENTACYJNA — ETAP 3
## Frontend Web: Integracja z API + Full Checkout Flow

**Cel:** Zamienić prototypy UI na w pełni funkcjonalny frontend podłączony do backendu.
**Czas:** 3-4 sesje AI
**Wymagania wstępne:** Backend (Etap 2) uruchomiony na `http://localhost:4000`

---

## 🏗 ARCHITEKTURA FRONTENDU (Docelowa)

```
apps/web/
├── app/
│   ├── page.tsx                    # SSR/ISR: hero + featured + categories
│   ├── menu/
│   │   └── page.tsx                # ISR: pełne menu
│   ├── bag/
│   │   └── page.tsx                # Client: torba (localStorage + API sync)
│   ├── checkout/
│   │   └── page.tsx                # Client: checkout 3-krokowy
│   ├── track/
│   │   ├── page.tsx                # Client: lista zamówień (zalogowany)
│   │   └── [orderId]/
│   │       └── page.tsx            # Client: szczegóły + WebSocket
│   ├── login/
│   │   └── page.tsx                # Client: logowanie/rejestracja
│   ├── privacy/
│   │   └── page.tsx                # Static: polityka prywatności
│   ├── terms/
│   │   └── page.tsx                # Static: regulamin
│   ├── loading.tsx                 # ✅ Skeleton loader (globalny)
│   ├── not-found.tsx               # ✅ Custom 404
│   ├── error.tsx                   # ✅ Error boundary
│   └── layout.tsx                  # Root: CartProvider, AuthProvider, PWA
├── lib/
│   ├── api.ts                      # Axios instance + interceptors
│   ├── auth-context.tsx            # NOWY: JWT auth state
│   ├── cart-context.tsx            # ZMODYFIKOWANY: localStorage + API sync
│   ├── hooks.ts                    # React Query hooks
│   ├── use-create-order.ts         # ✅ Fixed import
│   └── query-client.ts             # NOWY: TanStack Query client
├── components/
│   └── (opcjonalnie)             # Page-specific components
└── public/
    ├── manifest.json               # PWA manifest
    ├── sw.js                       # Service Worker (wymaga implementacji)
    ├── robots.txt                  # ✅ SEO
    ├── sitemap.xml                 # ✅ SEO
    └── humans.txt                  # ✅ Transparency
```

---

## 📡 INTEGRACJA API

### Axios Instance (`lib/api.ts`)
```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // For HttpOnly cookies
});

// Request interceptor: add CSRF token
api.interceptors.request.use((config) => {
  const csrf = document.cookie.match(/csrf_token=([^;]+)/)?.[1];
  if (csrf) config.headers['X-CSRF-Token'] = csrf;
  return config;
});

// Response interceptor: handle 401, refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### React Query Setup (`lib/query-client.ts`)
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  },
});
```

### Hooks (`lib/hooks.ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

// Menu
export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const { data } = await api.get('/menu');
      return data;
    },
  });
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/menu/categories');
      return data;
    },
  });
}

// Product details
export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get(`/menu/products/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

// Orders (requires auth)
export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders');
      return data;
    },
  });
}

// Order details
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId,
    refetchInterval: 10000, // Poll every 10s as fallback
  });
}
```

---

## 🛒 FLOW ZAMÓWIENIA (Szczegółowy)

### 1. Przeglądanie Menu

**Strona główna (`app/page.tsx`)**
- SSR/ISR: `fetch('http://api:4000/menu')` w `getStaticProps` lub `generateStaticParams`
- Revalidate: 60s (ISR)
- Error handling: `error.tsx` boundary
- Loading: `loading.tsx` skeleton

**Komponenty:**
- `HeroSection` — statyczny (nie wymaga API)
- `CategoryGrid` — z API: `useCategories()`
- `FeaturedProducts` — z API: `useMenu()` + filter `isFeatured`
- `ProductCard` — z `packages/ui` (już gotowy)

**Interakcja:**
```
User kliknie "Dodaj" na ProductCard
  → IF product ma variants LUB addons:
    → Otwórz PizzaBuilder (Dialog z @ros/ui)
    → Fetch product details (variants, addons)
    → User wybiera variant + addons
    → Klik "Dodaj do torby"
      → Fly-to-bag animation (CSS keyframes)
      → CartContext.addItem({ productId, variantId, addons, quantity })
      → localStorage.setItem('cart', JSON.stringify(cart))
      → IF user zalogowany: POST /cart/sync
  → ELSE (prosty produkt):
    → CartContext.addItem({ productId, quantity: 1 })
    → Fly-to-bag animation
```

### 2. Torba (`app/bag/page.tsx`)

**Stan:**
- Guest: `localStorage.getItem('cart')`
- Zalogowany: `GET /cart` + localStorage (merge po loginie)

**Funkcjonalność:**
- Wyświetlenie pozycji z obrazkami, nazwami, cenami
- Zmiana ilości (+/-)
- Usuwanie pozycji (z animacją fade-out)
- FreeDeliveryProgress (z @ros/ui)
- Kalkulacja: subtotal + deliveryCost = total
- Klik "Zamów" → `/checkout`

**Walidacja przed checkout:**
- Min order value: sprawdź `subtotal >= MIN_ORDER_VALUE`
- Jeśli nie: shake animation na torba + komunikat

### 3. Checkout (`app/checkout/page.tsx`)

**3-krokowy wizard:**

#### Krok 1: Dane dostawy
```
Formularz (react-hook-form + zod):
  - deliveryType: "delivery" | "pickup" (radio)
  - IF delivery:
    - firstName, lastName (string, min 2)
    - phone (string, regex: ^+48[0-9]{9}$)
    - email (string, email)
    - street, buildingNumber, apartmentNumber
    - city, postalCode (regex: ^[0-9]{2}-[0-9]{3}$)
    - floor, intercom (optional)
    - notes (optional, max 500 chars)
  - IF pickup:
    - firstName, lastName
    - phone
    - email
    - notes (optional)
```

#### Krok 2: Metoda płatności
```
Radio buttons:
  - Karta (Stripe Elements)
  - BLIK (PayU)
  - Gotówka przy odbiorze
```

**Stripe Elements:**
```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// In component:
const { data: paymentIntent } = useQuery({
  queryKey: ['payment-intent', orderId],
  queryFn: async () => {
    const { data } = await api.post('/payments/stripe/create-intent', { amount });
    return data;
  },
  enabled: paymentMethod === 'card',
});
```

**PayU BLIK:**
```typescript
const { data: payuOrder } = useMutation({
  mutationFn: async () => {
    const { data } = await api.post('/payments/payu/create-order', { amount, description });
    return data;
  },
  onSuccess: (data) => {
    window.location.href = data.redirectUri; // PayU redirect
  },
});
```

#### Krok 3: Podsumowanie
```
- Lista pozycji (z obrazkami)
- Podsumowanie cen:
  - Subtotal: XX.XX zł
  - Dostawa: XX.XX zł (lub "Darmowa" jeśli >= threshold)
  - Razem: XX.XX zł
- Checkbox: "Akceptuję regulamin" (wymagane)
- Checkbox: "Zapisz dane do następnego zamówienia" (localStorage)
- Przycisk: "Złóż zamówienie i zapłać"
```

**Submit:**
```typescript
const createOrder = useMutation({
  mutationFn: async (orderData: CreateOrderData) => {
    const idempotencyKey = crypto.randomUUID();
    const { data } = await api.post('/orders', orderData, {
      headers: { 'X-Idempotency-Key': idempotencyKey },
    });
    return data;
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    clearCart();
    router.push(`/track/${data.orderId}`);
  },
  onError: (error: any) => {
    toast.error(error.response?.data?.message || 'Błąd podczas składania zamówienia');
  },
});
```

### 4. Śledzenie zamówienia (`app/track/[orderId]/page.tsx`)

**Dane:**
- `useOrder(orderId)` — polling co 10s
- WebSocket: real-time updates

**WebSocket:**
```typescript
useEffect(() => {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL?.replace('http://', 'ws://').replace('https://', 'wss://') || 'ws://localhost:4001';
  const ws = new WebSocket(`${wsUrl}/orders`);

  ws.onopen = () => {
    // Send auth token
    const token = getCookie('access_token');
    ws.send(JSON.stringify({ event: 'auth', data: { token } }));
    // Join order room
    ws.send(JSON.stringify({ event: 'join_order', data: { orderId } }));
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.event === 'order_status_updated') {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      // Play notification sound
      if (msg.status === 'ready_for_pickup') {
        new Audio('/sounds/ready.mp3').play();
      }
    }
  };

  return () => ws.close();
}, [orderId]);
```

**Timeline:**
```
[Złożone] → [Potwierdzone] → [W przygotowaniu] → [Gotowe] → [W drodze] → [Dostarczone]
   ✅          ✅               ⏳                  ⏳           ⏳            ⏳
```

**Estimated time:**
- Based on status + queue length (from API)
- Show: "Szacowany czas: 25-35 minut"

---

## 🔐 AUTH CONTEXT (`lib/auth-context.tsx`)

```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

// Implementation:
// - Check /auth/me on mount (via cookie)
// - login: POST /auth/login, set user state
// - register: POST /auth/register, auto-login
// - logout: POST /auth/logout, clear user state
// - Persist in localStorage for UX (but auth is cookie-based)
```

---

## 🧪 TESTY

### Unit Tests (Jest + React Testing Library)
```
apps/web/__tests__/
├── components/
│   ├── product-card.test.tsx
│   ├── pizza-builder.test.tsx
│   └── cart-context.test.tsx
├── hooks/
│   ├── use-menu.test.ts
│   └── use-create-order.test.ts
└── pages/
    ├── page.test.tsx
    └── checkout.test.tsx
```

### E2E Tests (Playwright)
```
e2e/
├── menu.spec.ts
├── checkout.spec.ts
├── auth.spec.ts
└── track.spec.ts
```

---

## 📋 CHECKLISTA ETAPU 3

### Integracja API
- [ ] Axios instance z interceptors
- [ ] React Query setup
- [ ] Auth context (login/register/logout/me)
- [ ] useMenu hook (ISR/SSG)
- [ ] useProduct hook
- [ ] useCart hook (localStorage + API sync)
- [ ] useCreateOrder mutation
- [ ] useOrders hook
- [ ] useOrder hook (z polling)
- [ ] WebSocket connection (z JWT auth)

### Strony
- [ ] `/` — SSR/ISR, real data
- [ ] `/menu` — ISR, categories + products
- [ ] `/bag` — client, full functionality
- [ ] `/checkout` — 3-krokowy, walidacja Zod
- [ ] `/track` — lista zamówień (auth required)
- [ ] `/track/[orderId]` — real-time tracking
- [ ] `/login` — formularz
- [ ] `/privacy` — static
- [ ] `/terms` — static

### Płatności
- [ ] Stripe Elements (card)
- [ ] PayU BLIK
- [ ] Cash on delivery
- [ ] Webhook handling (API side)

### PWA
- [ ] Service Worker (cache assets, offline page)
- [ ] Push notifications (opcjonalnie)
- [ ] Install prompt

### Performance
- [ ] Lighthouse 90+ (all categories)
- [ ] First Contentful Paint < 1.5s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1

### Testy
- [ ] Jest + RTL (min. 10 testów)
- [ ] Playwright E2E (min. 3 scenariusze)

---

*Ta specyfikacja została wygenerowana podczas sesji audytowej. Następna sesja AI powinna zacząć od "Integracja API" i systematycznie przechodzić przez checklistę.*

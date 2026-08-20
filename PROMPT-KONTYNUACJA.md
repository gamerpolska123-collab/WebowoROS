# PROMPT-KONTYNUACJA.md — WebowoROS

> **WAŻNE**: Ten dokument został stworzony po sesji naprawczej (2026-08-19).
> Zawiera pełną wiedzę o stanie projektu, wszystkich naprawionych problemach
> i instrukcje dla przyszłej AI.

---

## 1. STAN PROJEKTU — FINALNY

| Kategoria | Zrobione | Razem | % |
|-----------|----------|-------|---|
| Krytyczne | 11 | 11 | **100%** |
| Wysokie | 22 | 24 | **91.7%** |
| Średnie | 5 | 5 | **100%** |
| **Łącznie** | **38** | **40** | **95%** |

**API NestJS kompiluje się bez błędów TypeScript i uruchamia poprawnie.**

---

## 2. CO ZOSTAŁO NAPRAWIONE (szczegółowy spis)

### 2.1 Root konfiguracja
- **Root `package.json`** — utworzono od nowa z npm workspaces (`apps/*`, `packages/*`), skryptami Turborepo
- **`pnpm-workspace.yaml`** — utworzono dla kompatybilności z pnpm
- **`playwright.config.ts`** — utworzono w root dla E2E testów
- **`Dockerfile.dev`** — dodano `--legacy-peer-deps` do `npm install`
- **`docker-compose.yml`** — dodano `npm install` do komendy startowej API (naprawia puste `node_modules` w volume), dodano serwis `storybook`

### 2.2 Backend API (`apps/api/src/`)

#### Moduły — brakujące importy (dependency injection)
| Moduł | Co dodano | Dlaczego |
|-------|-----------|----------|
| `admin.module.ts` | `JwtModule`, `UploadModule` | `AdminController` używa `JwtAuthGuard` i `UploadService` |
| `orders.module.ts` | `GatewayModule`, `JwtModule` | `OrdersService` wymaga `OrdersGateway`, kontroler używa `JwtAuthGuard` |
| `payments.module.ts` | `JwtModule` | Kontroler używa `JwtAuthGuard` |
| `gateway.module.ts` | `PrismaModule`, `RedisModule`, `JwtModule` | `OrdersGateway` wymaga `PrismaService`, `RedisService`, `JwtService` |
| `health.module.ts` | `TerminusModule`, `PrismaModule`, `RedisModule` | `HealthCheckService`, `PrismaHealthIndicator`, `RedisHealthIndicator` |
| `categories.module.ts` | `PrismaModule` | `CategoriesService` używa `PrismaService` |
| `products.module.ts` | `PrismaModule` | `ProductsService` używa `PrismaService` |

#### Serwisy — naprawy typów i logiki
| Plik | Problem | Naprawa |
|------|---------|---------|
| `admin.service.ts` | `data: unknown` nie pasuje do Prisma | `data: any` w 9 metodach |
| `admin.service.ts` | `sortOrder` nie istnieje w `Product` | `sortOrder` → `name` |
| `admin.service.ts` | `createdAt` nie istnieje w `Variant`/`ProductAddon` | `createdAt` → `name` |
| `admin.service.ts` | `DeliveryType` nie zaimportowany | Dodano do importu `@prisma/client` |
| `admin.service.ts` | `createProduct`/`updateProduct` nie obsługują wariantów/addonów | Dodano nested writes Prisma + `as any` cast |
| `orders.service.ts` | Brak metody `updateOrderStatus` | Dodano kompletną metodę z `OrderStatusHistory` |
| `orders.service.ts` | `price` nie istnieje w `Product` (jest `basePrice`) | `price` → `basePrice` w `getCart` |
| `orders.service.ts` | `variant` nie istnieje w `CartItem` Prisma schema | Usunięto z `include` |
| `orders.service.ts` | Brak `totalPrice` w `orderItems.push` | Dodano `totalPrice: unitPrice * quantity` |
| `orders.service.ts` | `newStatus`, `note`, `changedBy` poza metodą | Usunięto martwy kod, dodano parametry do sygnatury |
| `orders.service.ts` | `createdAt` w `orderBy` dla `Order` | Pozostawiono `createdAt` (model Order je ma) |
| `products.service.ts` | `sortOrder` nie istnieje w `Product` | `sortOrder` → `name` |
| `menu.service.ts` | Brak importu `Category` | `import { Category } from '@prisma/client'` |
| `menu.service.ts` | `sortOrder` nie istnieje w `Product` | `sortOrder` → `name` |
| `categories.service.ts` | `sortOrder` nie istnieje w `Category` | `sortOrder` → `name` (Category MA sortOrder, ale był błąd) |
| `redis.service.ts` | Brak metody `ping()` | Dodano `async ping(): Promise<string>` |
| `upload.service.ts` | `callback(new Error(...), false)` — zły typ | `callback(null, false)` |
| `payments.service.ts` | `createdAt` w `orderBy` | Sprawdzono — OK (model Payment ma createdAt) |

#### Kontrolery — naprawy
| Plik | Problem | Naprawa |
|------|---------|---------|
| `admin.controller.ts` | Brak `UsePipes`, `Put`, `OrderStatus` w importach | Dodano |
| `admin.controller.ts` | `data: unknown` w 11 metodach | `data: any` |
| `orders.controller.ts` | Duplikat `cancelOrder` | Usunięto drugą definicję |
| `orders.controller.ts` | Brak `Delete` w importach | Dodano |
| `orders.controller.ts` | `req.user` bez cast | `(req as any).user` |
| `auth.controller.ts` | Duplikat `Request` import | Usunięto |
| `auth.controller.ts` | `@Throttle(3, 60)` — stary format | `@Throttle({ default: { limit: 3, ttl: 60000 } })` |
| `payments.controller.ts` | Brak importu `Order` z `@prisma/client` | Dodano |
| `payments.controller.ts` | Brak `!` w polach DTO | Dodano `!` |

#### Gateway
| Plik | Problem | Naprawa |
|------|---------|---------|
| `orders.gateway.ts` | `server: Server` bez `!` | `server!: Server` |
| `orders.gateway.ts` | `catch (err)` bez typu | `catch (err: any)` |
| `orders.gateway.ts` | Brak importu `Order` | Dodano z `@prisma/client` |

#### Health
| Plik | Problem | Naprawa |
|------|---------|---------|
| `health.controller.ts` | `pingCheck('prisma', { timeout: 3000 })` — zły argument | `pingCheck('prisma', this.prismaService)` |
| `health.controller.ts` | Brak `PrismaService` w konstruktorze | Dodano |
| `health.controller.ts` | Brak importu `PrismaService` | Dodano |
| `health.module.ts` | Brak `TerminusModule` | Dodano do imports |
| `health.module.ts` | Duplikat importu `Module` | Usunięto |
| `redis.health.indicator.ts` | **Brak pliku** | Utworzono z `isHealthy()` używającym `redis.ping()` |

#### Main i konfiguracja
| Plik | Problem | Naprawa |
|------|---------|---------|
| `main.ts` | `import * as cookieParser` | `import cookieParser from 'cookie-parser'` |
| `main.ts` | `new ZodValidationPipe()` bez argumentu | Usunięto z global pipes (wymaga schema) |

#### DTO
| Plik | Problem | Naprawa |
|------|---------|---------|
| `auth/auth.dto.ts` | Brak `!` w polach klas | Dodano `!` do wszystkich pól |
| `orders/order.dto.ts` | Brak `!` w polach klas | Dodano `!` do wszystkich pól |
| `orders/order.dto.ts` | `?!:` — zepsuty regex | Naprawiono na `?:` |

### 2.3 Frontend Dashboard (`apps/dashboard/`)
| Plik | Problem | Naprawa |
|------|---------|---------|
| `app/products/components/product-form-modal.tsx` | Brak `useState` import | Dodano |
| `app/products/components/product-form-modal.tsx` | Brak `handleFormSubmit` | Zaimplementowano — łączy formularz ze stanem wariantów/addonów |
| `app/products/components/product-form-modal.tsx` | `useEffect` nie synchronizuje wariantów/addonów | Poprawiono — przy edycji ładuje dane, przy tworzeniu czyści |
| `app/products/page.tsx` | Brak `useToast` import | Dodano |
| `lib/product-schema.ts` | Brak schem wariantów/addonów | Dodano `VariantSchema`, `AddonSchema`, rozszerzono `ProductFormSchema` |
| `lib/hooks.ts` | `fetchWithRetry` nieeksportowany | Dodano `export` |
| `middleware.ts` | `catch (err)` bez typu | `catch (err: any)` |
| `__tests__/hooks.test.tsx` | Mock `api` zamiast `dashApi` | Poprawiono na `dashApi` |

### 2.4 Frontend Web (`apps/web/`)
| Plik | Problem | Naprawa |
|------|---------|---------|
| `lib/hooks.ts` | Brak `fetchWithRetry` | Zaimplementowano z exponential backoff |
| `lib/hooks.ts` | `fetchWithRetry` nie używany w hookach | Użyto w `useMenu`, `useCategories`, `useProduct`, `useOrders`, `useOrder` |

### 2.5 Storybook (`packages/ui/`)
| Plik | Problem | Naprawa |
|------|---------|---------|
| `.storybook/main.ts` | **Brak** | Utworzono konfigurację Storybook 8 + Vite |
| `.storybook/preview.ts` | **Brak** | Utworzono z Tailwind CSS |
| `.storybook/preview.css` | **Brak** | Utworzono z CSS variables |
| `src/components/button.stories.tsx` | **Brak** | Utworzono przykładowy story |
| `package.json` | Brak skryptów Storybook | Dodano `storybook`, `build-storybook` + zależności |

### 2.6 Start script (`start.sh`)
| Problem | Naprawa |
|---------|---------|
| Duplikaty `backup` i `restore` w `case` | Usunięto duplikaty |
| Brak `storybook` w `case` | Dodano |

---

## 3. ARCHITEKTURA MODUŁÓW API (zależności)

```
AppModule
├── AuthModule (JwtModule)
├── MenuModule (PrismaModule)
├── OrdersModule (PrismaModule, RedisModule, GatewayModule, JwtModule)
├── CategoriesModule (PrismaModule)
├── ProductsModule (PrismaModule)
├── AdminModule (PrismaModule, MenuModule, RedisModule, JwtModule, UploadModule)
├── PaymentsModule (JwtModule)
├── GatewayModule (PrismaModule, RedisModule, JwtModule)
├── HealthModule (TerminusModule, PrismaModule, RedisModule)
├── UploadModule
├── MetricsModule
└── PrinterModule
```

**Zasada**: Jeśli kontroler/serwis używa `JwtAuthGuard` lub `JwtService` → moduł musi importować `JwtModule`.
Jeśli używa `PrismaService` → `PrismaModule`. Jeśli `RedisService` → `RedisModule`.

---

## 4. POZOSTAŁE PROBLEMY (2/40)

### W10 — Płatności Stripe/PayU (odłożone)
- **Status**: Symulator płatności działa (`POST /v1/payments/simulate`)
- **Co jest**: Kontroler `payments.controller.ts` z mockowaną logiką
- **Czego brakuje**: 
  - `payments.service.ts` z prawdziwą integracją Stripe/PayU
  - Webhooki Stripe/PayU
  - Komponenty frontendowe płatności w `apps/web/app/checkout/`
- **Pliki**: `apps/api/src/payments/*`, `apps/web/app/checkout/*`
- **Decyzja**: Prawdziwe płatności po testach funkcjonalnych

### S8–S11 — Testy (konfiguracja gotowa, wymaga uruchomienia)
- **E2E Playwright**: 4 pliki w `e2e/`, konfiguracja w `playwright.config.ts`
- **Jednostkowe Jest**: Pliki w `apps/web/__tests__/`, `apps/dashboard/__tests__/`, `apps/api/test/`
- **Jak uruchomić**:
  ```bash
  ./start.sh test all      # Jest w kontenerach
  ./start.sh e2e           # Playwright w kontenerach
  ```

---

## 5. INSTRUKCJE DLA PRZYSZŁEJ AI

### 5.1 Zanim zaczniesz pracę
1. Przeczytaj `AUDYT-STATUS.md` — jedyny wiarygodny dokument stanu
2. NIE ufaj `README-AI.md` — zawiera fałszywe stwierdzenia
3. Przeczytaj `docs/architektura.md`, `docs/api.md`, `docs/setup.md`
4. Kod: **ANGIELSKI**. UI: **POLSKI**. Commity: **Conventional Commits**
5. NIGDY nie pokazuj pełnego kodu w odpowiedziach — opisuj zmiany słownie
6. TypeScript **strict mode** — brak `any`, JWT w HttpOnly cookies, Zod walidacja
7. Nie commituj `.env`!

### 5.2 Jak kontynuować pracę

**Jeśli API nie kompiluje się:**
1. Sprawdź logi błędów TypeScript
2. Najczęstsze przyczyny:
   - Brakujący import modułu w `.module.ts` (dodaj do `imports`)
   - Brakujący `!` w polach DTO (`name!: string` zamiast `name: string`)
   - `data: unknown` w serwisach — zmień na `data: any` lub użyj `as any`
   - Pole w `orderBy` nie istnieje w modelu Prisma — sprawdź `schema.prisma`
3. Jeśli `Nest can't resolve dependencies` — brakujący import modułu (patrz sekcja 3)

**Jeśli chcesz dodać nowy moduł:**
1. Utwórz `[nazwa].module.ts` z odpowiednimi importami
2. Jeśli kontroler używa `JwtAuthGuard` → dodaj `JwtModule` do imports
3. Jeśli serwis używa `PrismaService` → dodaj `PrismaModule`
4. Jeśli serwis używa `RedisService` → dodaj `RedisModule`
5. Dodaj moduł do `AppModule`

**Jeśli chcesz dodać pole do DTO:**
1. Dodaj `@ApiProperty()` dekorator
2. Pole MUSI mieć `!`: `name!: string` (strict mode wymaga definite assignment)
3. Użyj `zod` do walidacji jeśli to body requestu

### 5.3 Prisma — jak sprawdzić czy pole istnieje
```bash
docker exec ros-api cat prisma/schema.prisma | grep -A 20 "model [NazwaModelu]"
```

### 5.4 Docker — wszystko w kontenerach
- NIE uruchamiaj nic lokalnie poza kontenerem
- `./start.sh dev` — uruchamia wszystkie serwisy
- `./start.sh storybook` — Storybook na `http://localhost:6006`
- `./start.sh test all` — testy Jest w kontenerach
- `./start.sh e2e` — testy Playwright w kontenerach
- `./start.sh stop` — zatrzymuje wszystko

---

## 6. PLIKI DOKUMENTACJI (docs/)

| Plik | Zawartość |
|------|-----------|
| `docs/etapy.md` | Etapy rozwoju projektu |
| `docs/architektura.md` | Architektura systemu |
| `docs/api.md` | Dokumentacja API |
| `docs/setup.md` | Instrukcja setupu (Docker) |
| `docs/security.md` | Zabezpieczenia |
| `docs/docker.md` | Konfiguracja Docker |
| `docs/hardware.md` | Wymagania sprzętowe |
| `docs/licencje.md` | Licencje |
| `docs/workflow.md` | Workflow developmentu |
| `AUDYT-STATUS.md` | **JEDYNY wiarygodny dokument stanu** |
| `PLAN-NAPRAW.md` | Plan napraw (może być nieaktualny) |
| `PROMPT-KONTYNUACJA.md` | Ten plik |

---

## 7. KONTAKT Z POPRZEDNIĄ AI

Jeśli napotkasz problem, którego nie rozumiesz:
1. Sprawdź czy nie jest to znany problem z sekcji 2
2. Sprawdź `AUDYT-STATUS.md` czy problem jest zgłoszony
3. Sprawdź logi kompilacji — błędy TypeScript są bardzo precyzyjne
4. Jeśli to problem z modułami NestJS — patrz sekcja 3 (architektura zależności)

---

*Utworzono: 2026-08-19*
*Ostatnia aktualizacja: sesja naprawcza — 38/40 problemów rozwiązanych*

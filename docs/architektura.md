# Architektura Systemu

## 1. Filozofia architektoniczna

System oparty na **modularnej architekturze mikroserwisów lekkich** (modular monolith z wyodrębnionymi serwisami tam, gdzie to uzasadnione). Priorytety:

1. **Niezawodność** - zamówienie nie może "zaginąć"
2. **Skalowalność horyzontalna** - możliwość wydzielenia serwisów na osobne maszyny
3. **Real-time** - natychmiastowa synchronizacja stanu między kuchnią, kierowcą a klientem
4. **Konfigurowalność** - właściciel ma pełną kontrolę nad upsellem, cenami i widocznością produktów z dashboardu

---

## 2. Diagram komponentów

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              UŻYTKOWNIK                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Klient     │  │   Kuchnia    │  │  Kierowca    │  │  Administrator│   │
│  │  (Next.js)   │  │ (Dashboard)  │  │ (Dashboard)  │  │  (Dashboard)  │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
└─────────┼─────────────────┼─────────────────┼─────────────────┼───────────┘
          │                 │                 │                 │
          └─────────────────┴─────────────────┴─────────────────┘
                                    │
                          ┌─────────▼──────────┐
                          │   Nginx (Reverse   │
                          │     Proxy + SSL)   │
                          └─────────┬──────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
   ┌──────▼──────┐          ┌──────▼──────┐          ┌──────▼──────┐
   │   Frontend  │          │   Backend   │          │   WebSocket │
   │   (Next.js) │◄────────►│   (NestJS)  │◄────────►│   (Socket.io)│
   │   :3000     │   API    │   :4000     │   Pub/Sub│   :4001      │
   └─────────────┘          └──────┬──────┘          └─────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
   ┌──────▼──────┐          ┌──────▼──────┐          ┌──────▼──────┐
   │  PostgreSQL │          │    Redis    │          │  Printer    │
   │   (menu,    │          │  (sessions, │          │   Service   │
   │  orders,    │          │   cache,    │          │  (Node.js)  │
   │  config)    │          │   pub/sub)  │          │   :5000     │
   │   :5432     │          │   :6379     │          └──────┬──────┘
   └─────────────┘          └─────────────┘                 │
                                                            │
                                                     ┌──────▼──────┐
                                                     │  Thermal    │
                                                     │  Printers   │
                                                     │  (USB/NET)  │
                                                     └─────────────┘
```

---

## 3. Model danych (ERD)

### 3.1 Core Models

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Category     │     │    Product      │     │    Variant      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │────►│ id (PK)         │────►│ id (PK)         │
│ name            │     │ name            │     │ product_id (FK) │
│ slug            │     │ description     │     │ name            │
│ sort_order      │     │ category_id(FK) │     │ price_adjustment│
│ is_active       │     │ base_price      │     │ is_active       │
│ image_url       │     │ image_url       │     └─────────────────┘
└─────────────────┘     │ is_available    │
                        │ is_featured     │
                        │ tags[]          │
                        └─────────────────┘
                                 │
                                 │
                        ┌────────▼────────┐
                        │  ProductAddon   │
                        ├─────────────────┤
                        │ id (PK)         │
                        │ product_id (FK) │
                        │ name            │
                        │ price           │
                        │ max_quantity    │
                        │ is_active       │
                        └─────────────────┘
```

### 3.2 Konfiguracja Upsellu i Rekomendacji (NOWE)

```
┌─────────────────────┐     ┌─────────────────────┐
│   UpsellConfig      │     │   BundleConfig      │
├─────────────────────┤     ├─────────────────────┤
│ id (PK)             │     │ id (PK)             │
│ name                │     │ name                │
│ type                │     │ discount_type       │
│   (cross_sell|      │     │   (percent|fixed)   │
│    bundle|          │     │ discount_value      │
│    last_minute|     │     │ is_active           │
│    threshold)       │     │ slots (JSON)        │
│ rules (JSON)        │     │   [{category_id,    │
│   {trigger_product, │     │     quantity}]       │
│    recommended[],   │     └─────────────────────┘
│    threshold_amount,│
│    discount}        │
│ is_active           │
│ priority            │
└─────────────────────┘

┌─────────────────────┐     ┌─────────────────────┐
│   PromoConfig       │     │   ProductBadge      │
├─────────────────────┤     ├─────────────────────┤
│ id (PK)             │     │ id (PK)             │
│ name                │     │ product_id (FK)     │
│ type                │     │ badge_type          │
│   (discount|        │     │   (bestseller|new|  │
│    free_delivery|   │     │    chef_choice|     │
│    addon_deal)      │     │    limited)         │
│ conditions (JSON)   │     │ is_active           │
│   {min_order_value, │     │ expires_at          │
│    applicable_to,   │     └─────────────────────┘
│    time_range}      │
│ reward (JSON)       │
│ start_date          │
│ end_date            │
│ is_active           │
└─────────────────────┘
```

### 3.3 Zamówienia

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Order       │────►│   OrderItem     │────►│ OrderItemAddon  │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ user_id (FK)    │     │ order_id (FK)   │     │ order_item_id   │
│ status          │     │ product_id (FK) │     │ addon_id (FK)   │
│ total_amount    │     │ variant_id (FK) │     │ quantity        │
│ delivery_type   │     │ quantity        │     │ price           │
│ payment_status  │     │ unit_price      │     └─────────────────┘
│ address JSON    │     │ notes           │
│ phone           │     └─────────────────┘
│ created_at      │
│ estimated_time  │
│ applied_promos  │
│   (JSON array)  │
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│     User        │     │  PriceHistory   │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ email           │     │ product_id (FK) │
│ phone           │     │ variant_id (FK) │
│ password_hash   │     │ old_price       │
│ role            │     │ new_price       │
│ addresses JSON  │     │ changed_by (FK) │
│ preferences     │     │ changed_at      │
│   (JSON)        │     │ reason          │
└─────────────────┘     └─────────────────┘
```

---

## 4. Flow zamówienia (z upsellem)

```
Klient              Frontend           API             Redis/DB       PrinterSvc
  │                   │                 │                 │                │
  │  1. Przegląda menu│                 │                 │                │
  │◄─────────────────►│  GET /menu      │                 │                │
  │                   │────────────────►│                 │                │
  │                   │                 │  SELECT + JOIN  │                │
  │                   │                 │  upsell configs │                │
  │                   │◄────────────────│                 │                │
  │                   │                 │                 │                │
  │  2. Klika "Dodaj" │                 │                 │                │
  │                   │  POST /cart/add │                 │                │
  │                   │────────────────►│                 │                │
  │                   │                 │  Sprawdź reguły │                │
  │                   │                 │  upsell dla     │                │
  │                   │                 │  produktu X     │                │
  │                   │◄────────────────│                 │                │
  │  3. Modal upsell  │                 │                 │                │
  │◄───────────────── │  {recommendations│                │                │
  │                   │   [cola, sos]}  │                 │                │
  │                   │                 │                 │                │
  │  4. Klient dodaje │                 │                 │                │
  │     rekomendację  │                 │                 │                │
  │                   │                 │                 │                │
  │  5. Checkout      │                 │                 │                │
  │  ────────────────►│  POST /orders   │                 │                │
  │                   │────────────────►│                 │                │
  │                   │                 │  BEGIN TRAN     │                │
  │                   │                 │  INSERT order   │                │
  │                   │                 │  COMMIT         │                │
  │                   │                 │  PUBLISH        │                │
  │                   │                 │  "new_order"    │                │
  │                   │                 │────────────────►│                │
  │                   │                 │                 │  LPUSH queue   │
  │                   │                 │                 │───────────────►│
  │                   │                 │                 │                │  PRINT
  │                   │  201 Created    │                 │                │
  │  6. Potwierdzenie │◄────────────────│                 │                │
  │◄───────────────── │                 │                 │                │
```

---

## 5. Stanowiska i uprawnienia (RBAC)

| Rola | Uprawnienia |
|------|-------------|
| `guest` | Przeglądanie menu, składanie zamówienia bez logowania |
| `customer` | Historia zamówień, zapisane adresy, ulubione produkty |
| `kitchen` | Dostęp do KDS, zmiana statusu zamówienia |
| `driver` | Lista dostaw, wydruk biletu kierowcy, zmiana statusu |
| `admin` | Pełny dostęp: menu, ceny, upsell, promocje, raporty, użytkownicy |

---

## 6. Strategia cache'owania

| Zasób | Strategia | TTL | Uzasadnienie |
|-------|-----------|-----|--------------|
| Menu (lista) | Redis + HTTP Cache | 5 min | Rzadko się zmienia, dużo odczytów |
| Szczegóły produktu | Redis | 10 min | Stabilne dane |
| Konfiguracja upsellu | Redis | 1 min | Często zmieniana, musi być fresh |
| Sesja użytkownika | Redis | 24h | Bezpieczeństwo + szybki dostęp |
| Zamówienie (active) | Redis | do zakończenia | Szybki dostęp do statusu |
| Ceny produktów | Redis + WebSocket | natychmiast | Zmiana ceny musi być instant |
| Statyczne assety | Nginx disk cache | 1 rok | JS/CSS/images z hash w nazwie |

---

## 7. Obsługa błędów i niezawodność

### Zamówienie (najważniejszy flow)
1. **Transakcja DB** - zamówienie albo zapisuje się w całości, albo w ogóle
2. **Outbox Pattern** - zapis zamówienia i eventu "new_order" w jednej transakcji
3. **Retry logic** - Printer Service próbuje wydrukować 3x z exponential backoff
4. **Dead Letter Queue** - zamówienia, których nie udało się wydrukować, trafiają do DLQ z alarmem
5. **Circuit Breaker** - przy awarii płatności, zamówienia mogą być składane jako "płatność przy odbiorze"

### KDS Offline
- KDS ładuje zamówienia z localStorage przy restarcie
- Synchronizacja "pending changes" po powrocie połączenia
- Dźwiękowe alerty działają lokalnie (niezależnie od sieci)

### Synchronizacja cen (WebSocket)
- Admin zmienia cenę w dashboardzie
- API zapisuje w DB + publikuje event `price_updated` na Redis Pub/Sub
- WebSocket Gateway broadcastuje do wszystkich podłączonych klientów
- Frontend aktualizuje cenę na żywo (bez przeładowania)

# Specyfikacja API

## 1. Konwencje

- **Base URL**: `https://api.domena.pl/v1`
- **Format**: JSON
- **Autentykacja**: JWT w HttpOnly cookie (access token) + refresh token
- **Paginacja**: `?page=1&limit=20`
- **Wersjonowanie**: URL path (`/v1/`, `/v2/`)

---

## 2. Autentykacja

### POST /auth/register
```json
{
  "email": "user@example.com",
  "phone": "+48123456789",
  "password": "SecurePass123!",
  "firstName": "Jan",
  "lastName": "Kowalski"
}
```

### POST /auth/login
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
**Response**: Sets `access_token` (HttpOnly, 15m) and `refresh_token` (HttpOnly, 7d) cookies.

### POST /auth/refresh
**Response**: New access token.

### POST /auth/logout
**Response**: Clears cookies.

---

## 3. Menu

### GET /menu
**Query params**:
- `category` (opcjonalne) - filtr po slugu kategorii
- `available=true` - tylko dostępne produkty

**Response**:
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Pizze",
      "slug": "pizze",
      "sortOrder": 1,
      "products": [
        {
          "id": "uuid",
          "name": "Margherita",
          "description": "Sos pomidorowy, ser mozzarella, bazylia",
          "basePrice": 29.00,
          "imageUrl": "https://cdn.domena.pl/images/margherita.jpg",
          "isAvailable": true,
          "isFeatured": true,
          "badges": ["bestseller", "chef_choice"],
          "variants": [
            { "id": "uuid", "name": "Mała 30cm", "priceAdjustment": 0 },
            { "id": "uuid", "name": "Średnia 40cm", "priceAdjustment": 10 },
            { "id": "uuid", "name": "Duża 50cm", "priceAdjustment": 18 }
          ],
          "addons": [
            { "id": "uuid", "name": "Extra ser", "price": 5.00, "maxQuantity": 2 },
            { "id": "uuid", "name": "Pieczarki", "price": 3.00, "maxQuantity": 1 }
          ],
          "upsellRecommendations": [
            { "id": "uuid", "name": "Cola 1L", "price": 5.00, "imageUrl": "..." },
            { "id": "uuid", "name": "Sos czosnkowy", "price": 3.00, "imageUrl": "..." }
          ],
          "tags": ["wegetariańska", "bestseller"],
          "allergens": ["gluten", "laktoza"]
        }
      ]
    }
  ],
  "activePromos": [
    {
      "id": "uuid",
      "name": "Sos za 1 zł",
      "type": "addon_deal",
      "description": "Dodaj sos czosnkowy za 1 zł przy zamówieniu powyżej 40 zł"
    }
  ],
  "freeDeliveryThreshold": 60.00
}
```

### GET /menu/products/:id
Szczegóły produktu z pełnymi relacjami.

---

## 4. Zamówienia (Orders)

### POST /orders
**Body**:
```json
{
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid",
      "quantity": 2,
      "addons": [
        { "addonId": "uuid", "quantity": 1 }
      ],
      "notes": "Bez cebuli"
    }
  ],
  "deliveryType": "delivery",
  "address": {
    "street": "Ignacego Mościckiego",
    "buildingNumber": "14",
    "apartmentNumber": "5",
    "city": "Gorzów Wielkopolski",
    "postalCode": "66-400",
    "floor": "2",
    "intercom": "5"
  },
  "contact": {
    "firstName": "Jan",
    "lastName": "Kowalski",
    "phone": "+48123456789",
    "email": "jan@example.com"
  },
  "paymentMethod": "card",
  "notes": "Proszę o cichy dzwonek",
  "tip": 5.00,
  "appliedPromoIds": ["uuid-promo-1"]
}
```

**Response**:
```json
{
  "id": "uuid",
  "orderNumber": "ZAM-20240812-001",
  "status": "pending_payment",
  "totalAmount": 78.00,
  "discountAmount": 5.00,
  "finalAmount": 73.00,
  "estimatedDeliveryTime": "2024-08-12T19:45:00Z",
  "paymentUrl": "https://pay.stripe.com/...",
  "createdAt": "2024-08-12T19:00:00Z"
}
```

### GET /orders/:id
Szczegóły zamówienia.

### GET /orders
**Query params**:
- `status` - filtr statusu
- `from`, `to` - zakres dat
- `page`, `limit`

### PATCH /orders/:id/status
**Body**:
```json
{
  "status": "preparing",
  "note": "Klient prosił o cichy dzwonek"
}
```
**Dostępne statusy**:
- `pending_payment` - oczekuje na płatność
- `paid` - opłacone, nowe
- `confirmed` - potwierdzone przez kuchnię
- `preparing` - w przygotowaniu
- `ready_for_pickup` - gotowe do odbioru
- `out_for_delivery` - w drodze do klienta
- `delivered` - dostarczone
- `cancelled` - anulowane

---

## 5. Dashboard (Admin)

### 5.1 Zarządzanie produktami

#### GET /admin/products
**Query**: `?category=&available=&search=&page=&limit=`

**Response**: Lista produktów z paginacją, sortowalna.

#### POST /admin/products
Tworzenie nowego produktu.

#### PUT /admin/products/:id
**Body**:
```json
{
  "name": "Nowa nazwa",
  "basePrice": 35.00,
  "isAvailable": true,
  "isFeatured": false,
  "categoryId": "uuid",
  "badges": ["bestseller"],
  "addons": [
    { "name": "Extra ser", "price": 5.00, "maxQuantity": 2 }
  ]
}
```
**Efekt uboczny**: Broadcast WebSocket event `product_updated` do wszystkich klientów.

#### PATCH /admin/products/:id/price
Szybka zmiana ceny (inline editing).
**Body**:
```json
{
  "basePrice": 32.00,
  "reason": "Promocja weekendowa"
}
```
**Efekt uboczny**: 
- Zapis do `PriceHistory`
- Broadcast `price_updated` via WebSocket
- Invalidacja cache Redis

#### PATCH /admin/products/:id/availability
**Body**:
```json
{ "isAvailable": false }
```
**Efekt uboczny**: Broadcast `product_unavailable` - produkt szary/ukryty na stronie.

#### PUT /admin/products/:id/variants/:variantId
Aktualizacja ceny wariantu.

#### DELETE /admin/products/:id
Usunięcie produktu (soft delete).

### 5.2 Zarządzanie kategoriami

#### GET /admin/categories
#### POST /admin/categories
#### PUT /admin/categories/:id
#### PATCH /admin/categories/reorder
**Body**:
```json
{
  "categoryIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

### 5.3 Konfiguracja Upsellu

#### GET /admin/upsell-configs
#### POST /admin/upsell-configs
**Body**:
```json
{
  "name": "Cross-sell po pizzy",
  "type": "cross_sell",
  "rules": {
    "triggerProductIds": ["uuid-pizza-1", "uuid-pizza-2"],
    "recommendedProductIds": ["uuid-cola", "uuid-sos"],
    "maxRecommendations": 3,
    "displayTiming": "after_add"
  },
  "isActive": true,
  "priority": 1
}
```

#### PUT /admin/upsell-configs/:id
#### DELETE /admin/upsell-configs/:id

### 5.4 Konfiguracja Zestawów (Bundles)

#### GET /admin/bundles
#### POST /admin/bundles
**Body**:
```json
{
  "name": "Zestaw Rodzinny",
  "discountType": "percent",
  "discountValue": 15,
  "slots": [
    { "categoryId": "uuid-pizza", "quantity": 2, "label": "Wybierz 2 pizze" },
    { "categoryId": "uuid-drinks", "quantity": 1, "label": "Wybierz napój" },
    { "categoryId": "uuid-sauces", "quantity": 1, "label": "Wybierz sos" }
  ],
  "isActive": true
}
```

#### PUT /admin/bundles/:id
#### DELETE /admin/bundles/:id

### 5.5 Konfiguracja Promocji

#### GET /admin/promos
#### POST /admin/promos
**Body**:
```json
{
  "name": "Sos za 1 zł",
  "type": "addon_deal",
  "conditions": {
    "minOrderValue": 40.00,
    "applicableProductIds": ["uuid-sos-czosnkowy"]
  },
  "reward": {
    "type": "fixed_price",
    "value": 1.00
  },
  "startDate": "2024-08-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "isActive": true
}
```

#### PUT /admin/promos/:id
#### PATCH /admin/promos/:id/toggle
Włączanie/wyłączanie promocji.

### 5.6 Konfiguracja strony (wygląd i zachowanie)

#### GET /admin/site-config
**Response**:
```json
{
  "theme": "light",
  "cartIcon": "pizza_bag",
  "addAnimation": "fly_to_bag",
  "freeDeliveryThreshold": 60.00,
  "minOrderValue": 40.00,
  "enableConfigurator": true,
  "enableSounds": true,
  "enableConfetti": true,
  "socialProofEnabled": true,
  "socialProofInterval": 30
}
```

#### PUT /admin/site-config
**Body**:
```json
{
  "freeDeliveryThreshold": 50.00,
  "enableConfetti": false
}
```
**Efekt uboczny**: Broadcast `config_updated` - strona klienta aktualizuje się natychmiast.

### 5.7 Statystyki i raporty

#### GET /admin/stats/sales
**Query**: `period=today|week|month|custom&from=&to=`

**Response**:
```json
{
  "totalRevenue": 4520.00,
  "totalOrders": 87,
  "averageOrderValue": 51.95,
  "topProducts": [
    { "productId": "uuid", "name": "Capriciosa", "quantity": 34, "revenue": 1326.00 }
  ],
  "upsellConversion": {
    "crossSellShown": 120,
    "crossSellAccepted": 45,
    "conversionRate": 37.5
  },
  "hourlyBreakdown": [
    { "hour": 18, "orders": 12, "revenue": 620.00 },
    { "hour": 19, "orders": 23, "revenue": 1180.00 }
  ]
}
```

#### GET /admin/stats/price-history
**Query**: `?productId=&from=&to=`

---

## 6. WebSocket Events (Socket.io)

### Namespace: `/orders`

**Client → Server**:
- `join_order_room` - dołączenie do pokoju zamówienia
- `update_status` - kuchnia/kierowca zmienia status

**Server → Client**:
- `order_status_changed` - `{ orderId, status, timestamp, estimatedTime }`
- `new_order` - broadcast do kuchni
- `price_updated` - `{ productId, oldPrice, newPrice }` - natychmiastowa aktualizacja na stronie
- `product_unavailable` - `{ productId }` - produkt szary/ukryty
- `product_updated` - `{ productId, changes }` - pełna aktualizacja produktu
- `config_updated` - `{ key, value }` - zmiana konfiguracji strony
- `promo_started` / `promo_ended` - aktywacja/dezaktywacja promocji

---

## 7. Kierowcy

### GET /driver/orders
Lista zamówień przypisanych do kierowcy.

### PATCH /driver/orders/:id/pickup
### PATCH /driver/orders/:id/deliver

---

## 8. Kody błędów

| Kod | Znaczenie |
|-----|-----------|
| `400` | Bad Request - błędne dane wejściowe |
| `401` | Unauthorized - brak autentykacji |
| `403` | Forbidden - brak uprawnień |
| `404` | Not Found |
| `409` | Conflict - np. produkt już istnieje |
| `422` | Unprocessable Entity - walidacja Zod |
| `429` | Too Many Requests - rate limit |
| `500` | Internal Server Error |

**Format błędu**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Nieprawidłowy numer telefonu",
    "details": [
      { "field": "phone", "message": "Format: +48XXXXXXXXX" }
    ]
  }
}
```

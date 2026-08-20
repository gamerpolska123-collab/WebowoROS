# Moduły Dodatkowe i Roadmap v2

> **Ten dokument opisuje moduły opcjonalne i rozszerzenia**, które nie są częścią MVP (Etapów 0-8), ale zostały uwzględnione w architekturze i API, aby umożliwić ich wdrożenie w przyszłości bez refaktoryzacji.

---

## ❌ Moduł wykluczony z MVP i v2: Zarządzanie Składnikami (Inventory / Magazyn)

> **Decyzja**: System **nie posiada modułu magazynowego**.  
> Jeżeli składnika zabraknie, personel ręcznie oznacza produkt jako niedostępny w dashboardzie (toggle `isAvailable`).  
> To świadoma decyzja — restauracja ma ustalony proces, a automatyczny magazyn wymagałby ciągłego utrzymywania stanów, co generuje dodatkową pracę administracyjną.

---

## 1. Zamówienia na Później (Pre-order)

### Problem
Klient chce zamówić pizzę na 19:30, ale jest teraz 15:00.

### Funkcjonalności
- Wybór daty i godziny dostawy/odbioru w checkout
- Walidacja: minimum 45 minut przed, maksymalnie 7 dni do przodu
- Kalendarz w dashboardzie — widok zamówień zaplanowanych na dany dzień/godzinę
- Przypomnienie SMS/email 30 min przed przygotowaniem
- Blokada godzin, gdy kuchnia jest przeładowana (np. max 10 zamówień na 19:00)

### API
```
POST /orders
{
  ...
  "scheduledFor": "2024-08-15T19:30:00+02:00"
}

GET /admin/schedule?date=2024-08-15
→ Lista zamówień pogrupowanych godzinowo
```

### Priorytet: WYSOKI

---

## 2. Kody Rabatowe i Vouchery

### Problem
Restauracja chce wysłać kupon "WITAJ10" nowym klientom lub "URODZINY" dla stałych.

### Funkcjonalności
- Generowanie kodów (jednorazowe, wielokrotne, limitowane czasowo)
- Reguły: minimalna wartość zamówienia, konkretne produkty, konkretne kategorie
- Typy rabatów: procentowy, kwotowy, darmowa dostawa, darmowy produkt
- Limit użycia per kod / per użytkownik
- Raporty: które kody najczęściej używane, konwersja

### Model danych
```
Voucher:
  id, code, type (percent/fixed/free_delivery/free_product)
  value, min_order_value, max_discount,
  usage_limit_total, usage_limit_per_user,
  valid_from, valid_to, applicable_products[], applicable_categories[],
  is_active, usage_count

OrderVoucher:
  order_id, voucher_id, discount_amount
```

### Priorytet: ŚREDNI

---

## 3. System Lojalnościowy (Punkty)

### Problem
Zatrzymanie klienta jest tańsze niż pozyskanie nowego.

### Funkcjonalności
- 1 zł wydany = 1 punkt (konfigurowalne)
- Wymiana punktów na rabaty (np. 100 pkt = 10 zł)
- Poziomy lojalności (Srebro, Złoto, Platyna) z benefitami
- Podwójne punkty w urodziny / w święta
- Widok punktów w profilu klienta
- Automatyczne proponowanie wykorzystania punktów przy checkout

### Priorytet: ŚREDNI (wdrożyć po 3-6 miesiącach)

---

## 4. Powiadomienia SMS i Email

### Kanały
| Wydarzenie | SMS | Email | Push |
|------------|-----|-------|------|
| Zamówienie przyjęte | ✓ | ✓ | ✓ |
| Płatność potwierdzona | ✗ | ✓ | ✓ |
| Zamówienie w przygotowaniu | ✗ | ✗ | ✓ |
| Zamówienie w drodze | ✓ | ✗ | ✓ |
| Zamówienie dostarczone | ✓ | ✓ | ✗ |
| Promocja (marketing) | ✗ | ✓ | ✓ |
| Przypomnienie pre-order | ✓ | ✓ | ✗ |

### Integracje
- **SMS**: SMSAPI / Twilio / SerwerSMS
- **Email**: SendGrid / Mailgun / SMTP
- **Push**: Web Push API (PWA)

### Szablony konfigurowalne z dashboardu
Właściciel może edytować treść SMS/email bez dewelopera.

### Priorytet: WYSOKI (SMS na start, reszta iteracyjnie)

---

## 5. Zarządzanie Kierowcami (GPS i Trasy)

### Problem
Właściciel nie wie gdzie jest kierowca i ile mu zajmie dostawa.

### Funkcjonalności
- **Aplikacja kierowcy (PWA)** — prostsza niż dashboard
- **GPS tracking** — kierowca udostępnia lokalizację (opcjonalnie, zgoda)
- **Widok na mapie** — admin widzi gdzie są kierowcy w czasie rzeczywistym
- **Szacowany czas dostawy** — aktualizowany na podstawie lokalizacji kierowcy
- **Przypisanie zamówień** — admin ręcznie lub auto-assign (najbliższy kierowca)
- **Historia tras** — raporty: ile km, ile dostaw, średni czas

### Technologia
- Google Maps API / Mapbox
- Geolocation API (w przeglądarce kierowcy)
- WebSocket do streamingu pozycji

### Priorytet: ŚREDNI (podstawowy widok kierowcy w MVP, GPS w v2)

---

## 6. Zamówienia Grupowe / Catering

### Problem
Firmy zamawiają 10-20 pizz na spotkanie. Potrzebują faktury i innego flow.

### Funkcjonalności
- **Formularz cateringowy** — ilość osób, preferencje dietetyczne, budżet
- **Oferta indywidualna** — restauracja przygotowuje propozycję zestawu
- **Faktura VAT** — dane do faktury w checkout
- **Zamówienie cykliczne** — np. "co piątek o 12:00 dla biura X"
- **Rabat ilościowy** — automatyczny przy > X sztuk

### Priorytet: NISKI (ale uwzględniony w architekturze)

---

## 7. System Opinii i Reklamacji

### Funkcjonalności
- Prośba o opinię 30 min po dostawie (SMS/email z linkiem)
- Ocena 1-5 gwiazdek + komentarz + zdjęcie
- **Moderacja** — admin akceptuje opinie przed publikacją (opcjonalnie)
- **Odpowiedź restauracji** — pod każdą opinią
- **Reklamacja** — osobny formularz, ticket system
- **Analiza sentymentu** — flagowanie negatywnych opinii do natychmiastowej reakcji

### Priorytet: ŚREDNI

---

## 8. Analityka Zaawansowana

### Metryki (dostępne z dashboardu)
- **Cohort Analysis** — jak zachowują się klienci z miesiąca X w kolejnych miesiącach
- **LTV (Lifetime Value)** — wartość życiowa klienta
- **Churn Rate** — ilu klientów nie wróciło
- **AOV by channel** — średnia wartość zamówienia z różnych źródeł
- **Heatmap godzin** — kiedy zamawiają najczęściej
- **Funnel Analysis** — gdzie użytkownicy porzucają zamówienie
- **A/B Test Results** — który upsell działa lepiej

### Integracje
- Google Analytics 4 (Ecommerce)
- Meta Pixel (Facebook Ads)
- Hotjar / Microsoft Clarity (heatmapy kliknięć)

### Priorytet: ŚREDNI (GA4 od startu, reszta iteracyjnie)

---

## 9. Multi-Location (Sieć restauracji)

### Problem
W przyszłości właściciel może otworzyć drugą lokalizację.

### Przygotowanie w architekturze
- Każdy `Product`, `Order`, `User` ma opcjonalne `location_id`
- Dashboard z przełącznikiem lokacji
- Menu może się różnić per lokalizacja
- Raporty per lokalizacja i consolidated

### Priorytet: NISKI (ale schema gotowa)

---

## 10. Integracje Zewnętrzne

| System | Integracja | Cel |
|--------|-----------|-----|
| **Google Business Profile** | API | Zamówienia bezpośrednio z wyszukiwarki |
| **Facebook/Instagram** | API | Zamówienia z postów i stories |
| **iFood / Wolt** | API | Agregacja zamówień zewnętrznych w jednym KDS |
| **Fakturownia / wfirma** | API | Automatyczne faktury VAT |
| **Google Calendar** | API | Pre-orders jako wydarzenia |
| **Slack / Discord** | Webhook | Powiadomienia o nowych zamówieniach dla zespołu |

### Priorytet: NISKI (opcjonalne)

---

## 11. Testowanie i Jakość (QA Strategy)

### Brakujący w MVP element — warto dodać do Etapu 0/1

#### Strategia testowania
```
Unit Tests (Jest) ──► Integration Tests (Supertest) ──► E2E (Playwright)
```

#### Szczegóły
- **Unit tests** — logika biznesowa (kalkulacja cen, promocje, upsell)
- **Integration tests** — API endpoints z testową bazą danych
- **E2E tests** — pełne ścieżki użytkownika (Playwright):
  - Dodanie pizzy do torby → checkout → płatność → śledzenie
  - Dashboard: zmiana ceny → weryfikacja na stronie
  - KDS: odbiór zamówienia → zmiana statusu
- **Load testing** — k6 / Artillery (czy system wytrzyma 50 zamówień/godzinę?)
- **Visual regression** — Chromatic / Percy (czy UI się nie rozjeżdża?)
- **Accessibility testing** — axe-core (WCAG 2.1 AA)

#### Kryteria akceptacji MVP
- Coverage > 80% (backend)
- Wszystkie krytyczne ścieżki pokryte E2E
- Lighthouse score > 90
- Load test: 100 równoległych użytkowników bez błędów

---

## 12. Performance Budget

### Cele wydajnościowe (do zdefiniowania w Etapie 1)

| Metryka | Cel | Jak mierzyć |
|---------|-----|-------------|
| **FCP** (First Contentful Paint) | < 1.5s | Lighthouse |
| **LCP** (Largest Contentful Paint) | < 2.5s | Lighthouse |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| **INP** (Interaction to Next Paint) | < 200ms | Lighthouse |
| **TTFB** (Time to First Byte) | < 600ms | WebPageTest |
| **Rozmiar JS** | < 200KB (gzipped) | Bundle Analyzer |
| **Rozmiar obrazów** | < 500KB per produkt | Lighthouse |
| **API response** | < 200ms (p95) | Prometheus |

---

## 13. Anti-Fraud i Ochrona Przed Nadużyciami

### Zagrożenia
- **Fake orders** — zamówienia na nieistniejący adres
- **Testowanie skradzionych kart** — małe zamówienia do weryfikacji karty
- **Boty / scraping** — automatyczne pobieranie menu/cen

### Środki
- **Weryfikacja adresu** — Google Maps API (czy adres istnieje)
- **Rate limiting** — max 3 zamówienia na godzinę z tego samego IP
- **3D Secure** — wymuszony dla nowych klientów
- **Phone verification** — SMS z kodem przy pierwszym zamówieniu
- **Blacklist** — blokowanie numerów telefonów / adresów email po anulowaniach
- **CAPTCHA** — reCAPTCHA v3 (niewidoczna) przy checkout
- **Honeypot** — ukryte pole w formularzu (złapie boty)

---

## Podsumowanie Roadmap v2

| Moduł | Szacowany czas | Kiedy wdrożyć |
|-------|---------------|---------------|
| Zamówienia na później | 1 tydzień | 1-2 miesiące po MVP |
| Kody rabatowe | 1 tydzień | 1-2 miesiące po MVP |
| Powiadomienia SMS | 3 dni | Od startu (podstawowe) |
| System lojalnościowy | 2 tygodnie | 3-6 miesięcy po MVP |
| GPS kierowców | 1 tydzień | 3-6 miesięcy po MVP |
| Catering / B2B | 2 tygodnie | Na życzenie klienta |
| Multi-location | 2 tygodnie | Gdy otworzą 2. lokalizację |
| Zaawansowana analityka | 1 tydzień | Ciągłość (iteracyjnie) |
| Integracje zewnętrzne | 1-3 dni each | Na życzenie |

> **Rekomendacja**: Zaimplementować moduły "Pre-order" i "SMS" możliwie szybko po MVP — są one kluczowe dla codziennej operacji restauracji.

---

*Moduły v2 v1.1 — 2026-08-13*  
*Zmiany: usunięcie modułu Inventory/Magazyn (personel ręcznie oznacza braki), aktualizacja priorytetów.*

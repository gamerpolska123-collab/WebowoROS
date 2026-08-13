# PROMPT: ETAP 3 — Frontend Klienta (Strona Zamówień)

Wykonaj ETAP 3 projektu Restaurant Order System.

## Cel
Pełnoprawna strona do składania zamówień z torbą, animacjami i upsellem.

## Zadania:

### Zadanie 1: Strona Główna
- `apps/web/app/page.tsx` — hero banner, sticky category tabs, lista produktów
- `apps/web/app/menu/page.tsx` — menu posegregowane na kategorie
- Parallax na zdjęciach produktów
- Pulsujące badge'e (bestseller, szef poleca)

### Zadanie 2: Torba Dostawcza
- `apps/web/components/PizzaBag.tsx` — ikona torby w headerze (4 stany)
- `apps/web/components/FlyToBag.tsx` — animacja dodawania (CSS bezier + particles)
- `apps/web/app/bag/page.tsx` — ekran torby (wizualizacja produktów w środku)
- Sticky bottom bar na mobile

### Zadanie 3: Konfigurator Pizzy
- `apps/web/components/PizzaConfigurator.tsx` — wybór rozmiaru + dodatki na grafice
- Dodatki jako CSS layers na obrazku pizzy
- Cena aktualizowana na żywo

### Zadanie 4: System Upsellu
- `UpsellModal.tsx` — cross-sell po dodaniu produktu (3 rekomendacje z API)
- `BundleBuilder.tsx` — interaktywny kreator zestawów (sloty z API)
- `LastMinuteAddons.tsx` — pasek przed płatnością (impulsowe dodatki < 10zł)
- `FreeDeliveryProgress.tsx` — termometr z confetti przy progu

### Zadanie 5: Checkout
- `apps/web/app/checkout/page.tsx` — 3 kroki (torba → dane → płatność)
- Formularz adresu z walidacją
- Wybór dostawy / odbioru
- Podsumowanie z zastosowanymi promocjami

### Zadanie 6: Śledzenie Zamówienia
- `apps/web/app/track/[orderId]/page.tsx` — ilustrowany timeline
- WebSocket: real-time status updates
- PWA: Service Worker + manifest

### Zadanie 7: SEO + PWA
- `apps/web/app/layout.tsx` — meta tagi, JSON-LD (Restaurant schema)
- `public/manifest.json` — PWA manifest
- `public/sw.js` — Service Worker (offline cart)
- `public/sitemap.xml` — dynamiczny sitemap

## Po zakończeniu:
ZAPISZ STAN PRACY w README-AI.md:
- "Etap 3 — Kod: Zakończony"
- Lighthouse score (Performance, Accessibility, SEO)
- Lista zaimplementowanych komponentów

Nie przechodź do Etapu 4 bez mojej zgody.
# PROMPT: ETAP 4 — Dashboard Administratora

Wykonaj ETAP 4 projektu Restaurant Order System.

## Cel
Panel zarządzania z natychmiastową synchronizacją strony klienta.

## Zadania:

### Zadanie 1: Layout i Nawigacja
- `apps/dashboard/app/layout.tsx` — sidebar + topbar
- `apps/dashboard/app/page.tsx` — dashboard overview (statystyki)
- Role-based access: admin widzi wszystko, kitchen tylko KDS, driver tylko dostawy

### Zadanie 2: Zarządzanie Produktami
- `apps/dashboard/app/products/page.tsx` — lista produktów (tabela + karty)
- `InlinePriceEditor.tsx` — kliknij cenę → wpisz nową → Enter → PATCH + WS broadcast
- `ProductForm.tsx` — formularz edycji produktu (nazwa, opis, cena, dostępność, badge'y)
- `CategoryReorder.tsx` — drag & drop kolejności kategorii
- `PriceHistoryChart.tsx` — wykres zmian cen (Recharts)

### Zadanie 3: Zarządzanie Upsellem
- `UpsellConfigPage.tsx` — lista konfiguracji upsellu
- `UpsellForm.tsx` — tworzenie/edycja reguł cross-sell (trigger → rekomendacje)
- `BundleConfigPage.tsx` — tworzenie zestawów (sloty + rabat)
- `PromoConfigPage.tsx` — promocje czasowe (warunki + nagroda)
- `BadgeManager.tsx` — przypisywanie badge'y do produktów

### Zadanie 4: Zarządzanie Zamówieniami
- `OrdersPage.tsx` — lista zamówień z filtrami (status, data, typ)
- `OrderDetail.tsx` — szczegóły zamówienia (produkty, adres, płatność, promocje)
- `StatusChanger.tsx` — zmiana statusu zamówienia (dropdown + WS broadcast)

### Zadanie 5: Raporty
- `SalesReport.tsx` — sprzedaż dzienna/tygodniowa/miesięczna (wykresy)
- `AovReport.tsx` — średnia wartość zamówienia
- `UpsellConversionReport.tsx` — konwersja upsellu (pokazano vs zaakceptowano)
- `PeakHoursReport.tsx` — godziny szczytu
- Eksport CSV/XLSX

### Zadanie 6: Konfiguracja Strony
- `SiteConfigPage.tsx` — wygląd i zachowanie strony klienta
  - Wybór ikony: torba vs koszyk
  - Włączanie animacji (fly-to-bag, confetti, shake)
  - Motyw: jasny / ciemny
  - Dźwięki: włącz/wyłącz
  - Próg darmowej dostawy
  - Minimalna wartość zamówienia
- Zmiany natychmiast broadcastowane przez WebSocket

## Po zakończeniu:
ZAPISZ STAN PRACY w README-AI.md:
- "Etap 4 — Kod: Zakończony"
- Lista stron dashboardu + funkcjonalności

Nie przechodź do Etapu 5 bez mojej zgody.
# PROMPT: ETAP 5 — Kitchen Display System i Drukarki

Wykonaj ETAP 5 projektu Restaurant Order System.

## Cel
System obsługi kuchni (KDS) + automatyczne drukowanie paragonów.

## Zadania:

### Zadanie 1: Kitchen Display System (KDS)
- `apps/dashboard/app/kds/page.tsx` — ekran kuchni (fullscreen)
- `KdsBoard.tsx` — Kanban board: 3 kolumny (Nowe → W przygotowaniu → Gotowe)
- `KdsCard.tsx` — karta zamówienia z timerem (od momentu złożenia)
- Grupowanie pozycji (3x Margherita = 1 karta z "x3")
- Dźwiękowe powiadomienie o nowym zamówieniu (Web Audio API)
- Bump: przeciągnij kartę między kolumnami → PATCH status + WS broadcast

### Zadanie 2: Printer Service
- `apps/printer-service/src/index.ts` — serwis Node.js
- `PrinterQueue.ts` — Redis Queue (BullMQ lub custom)
- `EscposPrinter.ts` — wrapper na node-escpos (USB + Ethernet)
- Retry logic: 3 próby z exponential backoff
- Dead Letter Queue dla nieudanych wydruków

### Zadanie 3: Szablony Wydruków
- `templates/kitchen-ticket.ts` — bilet kuchenny:
  - Numer zamówienia, godzina
  - Lista pozycji (nazwa, wariant, dodatki, uwagi)
  - Grupowanie
- `templates/driver-ticket.ts` — bilet kierowcy:
  - Adres, telefon, piętro, domofon
  - Uwagi do dostawy
  - QR code z mapą (opcjonalnie)
- `templates/receipt.ts` — paragon (dla kasy)

### Zadanie 4: Konfiguracja Drukarek w Dashboardzie
- `PrinterConfigPage.tsx` — lista drukarek
- `PrinterForm.tsx` — dodawanie drukarki (nazwa, IP/port lub USB, typ szablonu)
- Test wydruku z dashboardu

### Zadanie 5: Integracja z API
- Nowe zamówienie → API publikuje event "new_order" na Redis
- Printer Service odbiera z kolejki → drukuje → potwierdza
- Status wydruku widoczny w dashboardzie

## Po zakończeniu:
ZAPISZ STAN PRACY w README-AI.md:
- "Etap 5 — Kod: Zakończony"
- Lista podłączonych drukarek (testowych)
- Czas wydruku (cel: < 5s)

Nie przechodź do Etapu 6 bez mojej zgody.

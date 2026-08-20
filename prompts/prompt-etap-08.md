# PROMPT: ETAP 8 — Testy UAT, Szkolenie i Odbiór

Wykonaj ETAP 8 projektu Restaurant Order System.

## Cel
Finalne testy, wdrożenie danych klienta, szkolenie, uruchomienie produkcyjne.

## Zadania:

### Zadanie 1: Testy UAT
- `docs/UAT-CHECKLIST.md` — lista testów do wykonania z personelem
- Pełna ścieżka: wejście → zamówienie → płatność → dostawa
- Testy edge case: brak internetu (KDS offline), anulowanie zamówienia, refund
- Testy wydajnościowe: 50 zamówień/godzinę (k6 / Artillery)
- Testy bezpieczeństwa: OWASP ZAP (podstawowy skan)

### Zadanie 2: Wdrożenie Danych Klienta
- Wypełnij `SiteConfig` prawdziwymi danymi (nazwa, adres, telefon, godziny otwarcia)
- Wgraj prawdziwe menu, ceny i zdjęcia (via dashboard lub SQL seed)
- Skonfiguruj upsell i promocje zgodnie z preferencjami właściciela
- Ustaw strefy dostawy i ceny dostawy

### Zadanie 3: Konfiguracja Drukarek
- Podłącz drukarki termiczne do RPi (USB / Ethernet)
- Skonfiguruj w dashboardzie (IP, port, typ szablonu: kitchen/driver)
- Test wydruku: bilet kuchenny, bilet kierowcy
- Weryfikacja: < 5s od zamówienia do wydruku

### Zadanie 4: Szkolenie
- `docs/TRAINING-ADMIN.md` — instrukcja dla administratora (dashboard, raporty, zmiana cen)
- `docs/TRAINING-KITCHEN.md` — instrukcja dla kuchni (KDS, obsługa zamówień, oznaczanie produktów jako niedostępne)
- `docs/TRAINING-DRIVER.md` — instrukcja dla kierowcy (aplikacja, wydruki)
- `docs/TRAINING-CASHIER.md` — instrukcja dla kasjera (jak czytać bilet kierowcy i przepisywać na kasę fiskalną)
- Przeprowadź szkolenie (2h) i zbierz podpisy

### Zadanie 5: Dokumentacja Użytkownika
- `docs/USER-GUIDE.pdf` (lub wiki) — kompletna instrukcja obsługi
- FAQ — najczęstsze pytania i odpowiedzi
- Kontakt do supportu (Twój email / telefon)

### Zadanie 6: Uruchomienie Produkcyjne
- Przełączenie z testowego Stripe na produkcyjny
- Włączenie prawdziwych powiadomień SMS (opcjonalnie)
- Monitoring 72h — brak krytycznych bugów
- Akceptacja klienta + przekazanie finalnej płatności

## Po zakończeniu:
ZAPISZ STAN PRACY w README-AI.md:
- "Etap 8 — Kod: Zakończony"
- "STATUS PROJEKTU: PRODUKCYJNY 🚀"
- Lista znanych bugów / TODO na v2
- Data uruchomienia

GRATULACJE — projekt zakończony!
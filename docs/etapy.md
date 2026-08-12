# Plan Etapowy (Roadmap)

> **Filozofia**: Każdy etap jest zamkniętym, wdrażalnym przyrostem produktu (MVP + iteracje). Nie przechodzimy dalej, dopóki poprzedni etap nie zostanie zaakceptowany.

---

## Etap 0: Infrastruktura i Setup (Tydzień 1)

**Cel**: Przygotowanie środowiska pracy, repozytorium, CI/CD i lokalnej infrastruktury Docker.

### Deliverables
- [ ] Monorepo z konfiguracją Turborepo / pnpm workspaces
- [ ] Konfiguracja ESLint, Prettier, TypeScript (strict mode)
- [ ] Docker Compose dla środowiska dev (PostgreSQL, Redis, Nginx)
- [ ] GitHub Actions: CI (testy + lint + build) przy każdym PR
- [ ] GitHub Actions: CD (auto-deploy na staging Raspberry Pi)
- [ ] Struktura katalogów i szablonów aplikacji (Next.js, NestJS)
- [ ] Wspólne pakiety: `shared-types`, `ui`, `config`
- [ ] Dokumentacja setupu deweloperskiego

### Kryteria akceptacji
- `pnpm dev` uruchamia wszystkie usługi lokalnie
- Każdy PR przechodzi checki CI
- Docker Compose działa bez błędów na x86_64 i ARM64

---

## Etap 1: Design System i Prototypy UX (Tydzień 2-3)

**Cel**: Stworzenie spójnego języka wizualnego i interaktywnych prototypów wszystkich ekranów.

### Deliverables
- [ ] Kompletny Design System w Figma (kolory, typografia, spacing, komponenty)
- [ ] Biblioteka komponentów shadcn/ui z rozszerzeniami:
  - Pizza Bag (torba dostawcza zamiast koszyka)
  - Fly-to-bag animation prototype
  - Product card z badge'ami (bestseller, szef poleca)
  - Upsell modal
  - Bundle builder
  - Progress bar "darmowa dostawa"
- [ ] Prototypy interaktywne (Figma) dla:
  - Strony głównej z menu i torbą
  - Modalu dodatków do pizzy (graficzny konfigurator)
  - Modalu upsellu (cross-sell)
  - Ekranu torby (rozwiniętej)
  - Checkoutu z "ostatnią szansą"
  - Dashboardu kuchni (KDS)
  - Dashboardu administratora (zarządzanie produktami, cenami, upsellem)
  - Widoku kierowcy
- [ ] Dokumentacja UX z trikami psychologicznymi (zob. `ui-ux.md`)
- [ ] Responsywność: mobile-first (70% ruchu to telefony)

### Kryteria akceptacji
- Wszystkie ekrany zaprojektowane w 3 breakpointach (mobile, tablet, desktop)
- Prototypy przetestowane z użytkownikami (5 osób)
- Design System zaakceptowany przez Klienta
- **Torba dostawcza** zamiast koszyka zaakceptowana jako główny wzorzec

---

## Etap 2: Core Backend & Baza Danych (Tydzień 3-5)

**Cel**: Stworzenie solidnego fundamentu API, modeli danych i autentykacji.

### Deliverables
- [ ] Schemat bazy danych (Prisma ORM):
  - Menu (kategorie, produkty, warianty, dodatki)
  - Zamówienia (z promocjami i upsellem)
  - Użytkownicy (role: guest, customer, kitchen, driver, admin)
  - Konfiguracja (upsell, promocje, zestawy, badge'y, ustawienia strony)
  - Historia cen (audyt zmian)
- [ ] REST API v1:
  - Menu (CRUD kategorii, produktów, wariantów, dodatków)
  - Zamówienia (tworzenie, statusy, historia, aplikowanie promocji)
  - Użytkownicy (rejestracja, logowanie, adresy)
  - Konfiguracja (godziny otwarcia, strefy dostawy, ceny dostawy)
  - **Upsell configs** (rekomendacje, zestawy, promocje)
  - **Site config** (wygląd, animacje, progi)
- [ ] Autentykacja: JWT + refresh tokens (HttpOnly cookies)
- [ ] Role: `guest`, `customer`, `kitchen`, `driver`, `admin`
- [ ] WebSocket: podstawowa infrastruktura Socket.io
- [ ] Seedery z przykładowym menu (pizza, makarony, zupy, napoje)
- [ ] Testy jednostkowe i integracyjne (Jest, Supertest)

### Kryteria akceptacji
- 100% endpointów pokrytych testami integracyjnymi
- Postman collection gotowa do testowania
- Baza danych obsługuje złożone relacje (menu + warianty + dodatki + promocje + upsell)
- **Zmiana ceny produktu w API natychmiast broadcastowana przez WebSocket**

---

## Etap 3: Frontend Klienta - Strona Zamówień (Tydzień 5-8)

**Cel**: Pełnoprawna strona do składania zamówień z maksymalizacją konwersji.

### Deliverables
- [ ] Strona główna z menu posegregowanym na kategorie (z sticky navigation)
- [ ] **Torba dostawcza** zamiast koszyka:
  - Ikona torby w headerze z dynamicznym stanem (pusta → pełna)
  - Animacja "fly-to-bag" (produkt leci do torby po łuku)
  - Efekt cząsteczek (ser, pomidor, bazylia)
  - Sticky bottom bar z podsumowaniem
  - Ekran torby z wizualizacją produktów "w środku"
- [ ] **Konfigurator pizzy** (graficzny):
  - Wybór rozmiaru (pizza rośnie na grafice)
  - Dodatki wyświetlane na grafice pizzy (CSS layers)
  - Cena aktualizowana na żywo
- [ ] **System upsellu**:
  - Smart cross-sell modal po dodaniu produktu
  - "Uzupełnij swoją pizzę" (addon modal z grafiką)
  - Bundle builder (interaktywny kreator zestawów)
  - Last-minute add-ons (przed płatnością)
  - "Dodaj za 1 zł" (loss leader promocje)
- [ ] **Gamifikacja**:
  - Progress bar "darmowa dostawa" z termometrem
  - Confetti (ikony jedzenia) przy osiągnięciu progu
  - Shake torby przy błędzie minimum
- [ ] Koszyk z dynamicznymi obliczeniami (promocje, upsell)
- [ ] Checkout (dane kontaktowe, adres, wybór dostawy/odbioru, płatność)
- [ ] Strona śledzenia zamówienia (real-time via WebSocket, ilustrowany timeline)
- [ ] System ocen i opinii (po realizacji zamówienia)
- [ ] Implementacja trików psychologicznych (zob. `ui-ux.md`):
  - Social proof, scarcity, anchoring, progress bar, upselling
- [ ] SEO: meta tagi, structured data (JSON-LD dla Restaurant), sitemap
- [ ] PWA: Service Worker, manifest, offline cart
- [ ] Analityka: Google Analytics 4 + Meta Pixel (opcjonalnie)

### Kryteria akceptacji
- Lighthouse score > 90 (Performance, Accessibility, SEO)
- Koszyk działa płynnie na urządzeniach mobilnych (3G)
- Pełna ścieżka: wejście → zamówienie < 3 minuty
- **Animacja fly-to-bag działa płynnie (60fps) na mobile**
- **Upsell modal wyświetla się w < 200ms po dodaniu produktu**

---

## Etap 4: Dashboard Administratora (Tydzień 8-10)

**Cel**: Panel zarządzania treścią, zamówieniami, cenami i konfiguracją upsellu w czasie rzeczywistym.

### Deliverables
- [ ] Logowanie i zarządzanie użytkownikami (RBAC)
- [ ] Zarządzanie menu:
  - Dodawanie/edycja/usuwanie kategorii i produktów
  - Zarządzanie wariantami (rozmiary pizzy) i dodatkami
  - **Zmiana cen z natychmiastową synchronizacją na stronie klienta** (WebSocket broadcast)
  - Zarządzanie dostępnością produktów (toggle "dziś niedostępne")
  - **Inline editing cen** (kliknij cenę → wpisz nową → Enter)
  - **Historia zmian cen** (wykres + audyt: kto, kiedy, stara→nowa)
- [ ] **Zarządzanie upsellem i konwersją**:
  - Smart cross-sell: przypisywanie rekomendacji do produktów
  - Bundle builder: tworzenie zestawów z rabatem
  - Promocje czasowe: "dodaj za 1 zł", darmowa dostawa, progi
  - Badge'y: bestseller, nowość, szef poleca (ręczne + automatyczne)
  - Powiadomienia toast (social proof) - konfiguracja treści i częstotliwości
- [ ] **Konfiguracja wyglądu strony**:
  - Wybór ikony: torba na pizzę / klasyczny koszyk
  - Włączanie/wyłączanie animacji (fly-to-bag, confetti, shake)
  - Motyw: jasny / ciemny / auto
  - Dźwięki: włącz/wyłącz
  - Konfigurator pizzy: włącz/wyłącz
- [ ] Zarządzanie zamówieniami:
  - Lista zamówień z filtrami (status, data, typ)
  - Szczegóły zamówienia (produkty, adres, płatność, zastosowane promocje)
  - Zmiana statusu zamówienia
  - Anulowanie i zwroty
- [ ] Raporty i statystyki:
  - Sprzedaż dzienna/tygodniowa/miesięczna
  - Najpopularniejsze produkty
  - Średnia wartość zamówienia (AOV)
  - **Konwersja upsellu** (ile razy pokazano vs zaakceptowano)
  - Godziny szczytu
- [ ] Konfiguracja systemu:
  - Godziny otwarcia (z wyjątkami świątecznymi)
  - Strefy dostawy z mapą (Google Maps API)
  - Ceny dostawy per strefa
  - Minimalna wartość zamówienia
  - Próg darmowej dostawy

### Kryteria akceptacji
- Zmiana ceny produktu widoczna na stronie klienta w < 2 sekundy
- Dashboard działa płynnie na tablecie (iPad dla kierowców/kuchni)
- Eksport raportów do CSV/XLSX
- **Właściciel może samodzielnie skonfigurować upsell bez pomocy dewelopera**
- **Zmiana konfiguracji strony (animacje, progi) natychmiast widoczna na stronie**

---

## Etap 5: Kitchen Display System (KDS) i Drukarki (Tydzień 10-12)

**Cel**: System obsługi kuchni i automatycznego drukowania dokumentów.

### Deliverables
- [ ] **KDS (Kitchen Display System)**:
  - Ekran zamówień w kolejności przyjścia (FIFO)
  - Kolorowe statusy (nowe, w przygotowaniu, gotowe)
  - Timer przy każdym zamówieniu (od momentu złożenia)
  - Grupowanie pozycji (np. 3x Margherita na jednym bilecie)
  - Dźwiękowe powiadomienia o nowym zamówieniu
  - Tryb "Bump" (przesuwanie między kolumnami jak Kanban)
- [ ] **Serwis drukarek (Printer Service)**:
  - Obsługa drukarek termicznych ESC/POS (USB i Ethernet)
  - Szablony wydruków:
    - **Bilet kuchenny** (pozycje, uwagi, czas zamówienia)
    - **Bilet kierowcy** (adres, telefon, uwagi do dostawy, mapa QR)
    - **Paragon fiskalny** (integracja z drukarką fiskalną via API dostawcy)
  - Automatyczny wydruk przy nowym zamówieniu
  - Kolejka wydruków (Redis Queue) z retry logic
- [ ] Konfiguracja drukarek w dashboardzie (IP, port, typ szablonu)

### Kryteria akceptacji
- Nowe zamówienie drukuje się w < 5 sekund od złożenia
- KDS działa bezawaryjnie przez 8h ciągłej pracy
- Możliwość podłączenia min. 3 drukarek jednocześnie (kuchnia, kierowca, kasa)

---

## Etap 6: Płatności i Bezpieczeństwo (Tydzień 12-13)

**Cel**: Bezpieczne i wygodne płatności online oraz pełne zabezpieczenie systemu.

### Deliverables
- [ ] Integracja płatności (Stripe lub PayU):
  - Płatność kartą (3D Secure)
  - BLIK (jeśli dostępny w API)
  - Płatność przy odbiorze (gotówka/terminal)
- [ ] Webhooki: obsługa statusów płatności (sukces, failure, refund)
- [ ] HTTPS + SSL (Let's Encrypt, auto-renewal)
- [ ] Rate limiting, CORS, Helmet.js
- [ ] Walidacja wszystkich inputów (Zod)
- [ ] Polityka prywatności i regulamin (RODO/GDPR compliant)
- [ ] Backup bazy danych (automatyczny, codzienny)

### Kryteria akceptacji
- Przejście płatności end-to-end w środowisku testowym
- Audyt bezpieczeństwa (OWASP Top 10)
- Certyfikat SSL z oceną A+ na SSL Labs

---

## Etap 7: Optymalizacja i Deployment (Tydzień 13-14)

**Cel**: Wdrożenie na Raspberry Pi 4 i optymalizacja wydajności.

### Deliverables
- [ ] Multi-arch Docker images (linux/arm64)
- [ ] Optymalizacja obrazów (Alpine Linux, multi-stage builds)
- [ ] Nginx: gzip, brotli, cache, rate limiting
- [ ] PM2 / systemd dla procesów Node.js (fallback)
- [ ] Monitoring:
  - Logs (Loki / simple file rotation)
  - Metrics (Prometheus + Grafana dashboards)
  - Uptime monitoring (Uptime Kuma)
- [ ] Automatyczne backupy (restic / rclone do chmury)
- [ ] Dokumentacja wdrożeniowa (runbook)

### Kryteria akceptacji
- Strona ładuje się w < 2s na Pi 4 (LTE/WiFi)
- System obsługuje 50 jednoczesnych zamówień/godzinę
- Uptime > 99.5% (monitoring przez 7 dni)

---

## Etap 8: Testy, Szkolenie i Odbiór (Tydzień 14-15)

**Cel**: Finalne testy, wdrożenie danych Klienta, szkolenie personelu.

### Deliverables
- [ ] Testy UAT (User Acceptance Testing) z personelem restauracji
- [ ] Wdrożenie prawdziwego menu, cen i zdjęć
- [ ] Konfiguracja upsellu i promocji zgodnie z preferencjami właściciela
- [ ] Konfiguracja drukarek na miejscu
- [ ] Szkolenie:
  - Administrator (dashboard, raporty, zarządzanie cenami i upsellem)
  - Kuchnia (KDS, obsługa zamówień)
  - Kierowcy (aplikacja, wydruki)
- [ ] Dokumentacja użytkownika (PDF / wiki)
- [ ] Umowa serwisowa i SLA (opcjonalnie)
- [ ] Uruchomienie produkcyjne 🚀

### Kryteria akceptacji
- Personel samodzielnie obsługuje system po 2h szkolenia
- Właściciel samodzielnie zmienia ceny i konfiguruje upsell
- Brak krytycznych bugów przez 72h testów produkcyjnych
- Klient akceptuje system i przekazuje finalną płatność

---

## 📅 Podsumowanie timeline

| Etap | Czas | Kluczowy rezultat |
|------|------|-------------------|
| 0 | 1 tydzień | Gotowe środowisko dev |
| 1 | 2 tygodnie | Zaakceptowane projekty UI (torba, upsell, animacje) |
| 2 | 2-3 tygodnie | Działające API + baza (z upsell configs) |
| 3 | 3-4 tygodnie | Strona zamówień z torbą, animacjami i upsellem |
| 4 | 2 tygodnie | Panel admina z pełną konfiguracją |
| 5 | 2 tygodnie | Kuchnia + drukarki |
| 6 | 1 tydzień | Płatności + security |
| 7 | 1-2 tygodnie | Raspberry Pi + monitoring |
| 8 | 1-2 tygodnie | Odbiór + szkolenie |
| **RAZEM** | **15-17 tygodni** | **Pełny system produkcyjny** |

---

## 🔄 Zarządzanie zmianą (Change Management)

Po zakończeniu Etapu 1 każda zmiana wymaga:
1. Ticketu w GitHub Issues
2. Oszacowania wpływu na timeline
3. Akceptacji przez Klienta (dla zmian > 4h pracy)
4. Aktualizacji dokumentacji

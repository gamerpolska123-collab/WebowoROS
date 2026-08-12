# UX/UI Design & CRO (Conversion Rate Optimization)

> **Cel**: Maksymalizacja wartości zamówienia (AOV) oraz konwersji poprzez immersyjne doświadczenie zakupowe oparte na "torbie dostawczej", gamifikacji i konfigurowalnym systemie upsellu sterowanym z dashboardu.

---

## 1. Design System

### Paleta kolorów
```
Primary:    #E63946  (czerwień - apetyt, pilność, CTA)
Secondary:  #F4A261  (pomarańcz - ciepło, przyjemność)
Accent:     #2A9D8F  (zieleń - sukces, potwierdzenie)
Dark:       #1D3557  (granat - elegancja, czytelność)
Light:      #F1FAEE  (krem - tło, przestrzeń)
Gold:       #D4AF37  (premium, nagrody, gamifikacja)
Danger:     #D62828  (błąd, anulowanie)
```

### Typografia
- **Nagłówki**: Poppins (bold, czytelne)
- **Body**: Inter (wysoka czytelność na mobile)
- **Ceny**: Tabular nums (monospace) dla łatwego porównywania

---

## 2. TORBA DOSTAWCZA (zamiast koszyka)

### Koncepcja
Zamiast nudnej ikony koszyka z liczbą — użytkownik widzi **torbę dostawczą na pizzę** (papierową torbę z logo, uchwytami). To buduje mentalne skojarzenie z odbiorem gotowego zamówienia.

### Stany torby
```
[PUSTA]     → Płaska, zamknięta torba (subtelna, nie nachalna)
[1-2 item]  → Torba lekko napompowana, uchwyty unoszą się
[3-5 item]  → Torba wyraźnie wypełniona, lekko się ugina
[6+ item]   → Torba maksymalnie wypełniona, uchwyty napięte, 
              pojawia się badge "+X" z animacją bounce
```

### Animacja "Dodaj do torby" (Fly-to-Bag)
Gdy użytkownik klika "Dodaj":
1. **Zdjęcie produktu** (miniaturka) oderwa się od karty
2. **Lot** — produkt "leci" po łuku (bezier curve) w stronę torby
3. **Podczas lotu** — produkt obraca się o 360° i maleje do 30%
4. **Uderzenie** — przy kontakcie z torbą: torba wykonuje squash-and-stretch (ugina się i wraca)
5. **Efekt cząsteczek** — 5-8 małych ikonek (ser, pomidor, bazylia) wylatuje z torby i opada
6. **Dźwięk** — subtelny "plop" lub "whoosh" (opcjonalnie, wyciszony domyślnie)
7. **Haptic** — krótka wibracja na mobile (50ms)

### Sticky Bottom Bar (Mobile)
```
┌─────────────────────────────────────────┐
│  🍕 Twoja torba          3 item  87 zł  │
│  [Zobacz zamówienie →]                  │
└─────────────────────────────────────────┘
         ↑ Torba z lewej, cena z prawej
```

### Ekran torby (rozwinięty)
Zamiast standardowego listy — **wizualizacja 3D torby**:
- Każdy produkt to "paczka" włożona do torby
- Można przeciągać produkty w górę, aby usunąć (swipe-to-remove z animacją wypadania)
- Torba reaguje na ilość produktów (CSS transform: scaleY)
- Na dole: **uchwyt torby** z napisem "Zamów i zapłać"

---

## 3. SYSTEM UPSELLU I ZWIĘKSZANIA RACHUNKU

### 3.1 Smart Cross-Sell Modal (po dodaniu produktu)
Gdy klient dodaje pizzę — zamiast zamykać modal od razu, pojawia się **"Dobierz coś do tego!"**:

```
┌─────────────────────────────────────────┐
│  🍕 Pizza Margherita dodana do torby!   │
│                                         │
│  Klienci często dokupują:               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ 🥤 Cola │ │ 🧄 Sos  │ │ 🍰 Tira │   │
│  │  1L     │ │czosnkowy│ │ -misu   │   │
│  │ 5 zł    │ │ 3 zł    │ │ 12 zł   │   │
│  │ [+Dodaj]│ │ [+Dodaj]│ │ [+Dodaj]│   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                         │
│  [Nie, dzięki → Przejdź do torby]      │
└─────────────────────────────────────────┘
```

**Algorytm rekomendacji** (konfigurowalny z dashboardu):
- Reguły asocjacyjne: "Kto kupił X, kupił też Y"
- Kategoria komplementarna: pizza → napój, sos, deser
- Wartość progu: powyżej 40 zł → pokaż deser, powyżej 60 zł → pokaż napój premium
- Ręczne przypisanie w dashboardzie: produkt X → rekomendowane [Y, Z, W]

### 3.2 Progress Bar "Darmowa dostawa" (Gamifikacja)
Zamiast suchego paska — **termometr/pasek na torbie dostawczej**:

```
Twoja torba: 45 zł
🍕━━━━━━━━━━━━━━━🔥━━━━━━━━  Darmowa dostawa od 60 zł!
                 ↑
         "Jeszcze 15 zł!"
         "Dodaj napój 1L za 5 zł i masz darmową dostawę!"
```

**Animacja**: Gdy klient dodaje produkt, płomień "przesuwa się" w prawo. Po osiągnięciu progu:
- Confetti wewnątrz torby
- Badge "🔥 DARMOWA DOSTAWA!" z animacją pulse
- Zielony kolor zamiast pomarańczowego

**Konfiguracja z dashboardu**:
- Próg darmowej dostawy (zmienna, np. 50/60/70 zł)
- Produkty "podpowiadane" jako "ostatni krok" do darmowej dostawy
- Możliwość wyłączenia (np. w weekendy dostawa zawsze płatna)

### 3.3 Bundle Builder (Zestawy)
Zamiast listy zestawów — **interaktywny kreator**:

```
┌─────────────────────────────────────────┐
│  🎁 STWÓRZ SWÓJ ZESTAW                  │
│     Oszczędzasz do 20%!                 │
│                                         │
│  [1] Wybierz pizzę (2 szt.)             │
│     [Margherita ✓] [Capriciosa ○]      │
│                                         │
│  [2] Wybierz napój (1 szt.)             │
│     [Cola 1L ✓] [Sprite ○] [Woda ○]    │
│                                         │
│  [3] Wybierz dodatek (1 szt.)           │
│     [Sos czosnkowy ✓] [Deser ○]        │
│                                         │
│  Razem: 67 zł  ~~(Osobno: 84 zł)~~     │
│  [Dodaj zestaw do torby]                │
└─────────────────────────────────────────┘
```

**Dashboard**: Właściciel definiuje:
- Ilość slotów w zestawie (np. 2 pizze + 1 napój + 1 dodatek)
- Kategorie dozwolone w każdym slocie
- Rabat procentowy lub kwotowy
- Nazwę zestawu i grafikę

### 3.4 Last-Minute Add-Ons (Przed płatnością)
Na ekranie podsumowania, nad przyciskiem "Zamów" — **pasek z impulsowymi dodatkami**:

```
┌─────────────────────────────────────────┐
│  💡 Ostatnia szansa!                    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │🧄Sos │ │🌶️Oliw│ │🥤Cola│ │🍰Deser│   │
│  │+3zł  │ │+2zł  │ │+5zł  │ │+8zł  │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
│         ← przewijane poziomo →          │
├─────────────────────────────────────────┤
│  Razem: 89 zł   [Zamów i zapłać →]     │
└─────────────────────────────────────────┘
```

**Reguły** (konfigurowalne z dashboardu):
- Pokaż tylko produkty < 10 zł (impuls)
- Nie pokazuj kategorii już obecnej w zamówieniu (np. jeśli jest napój, nie pokazuj napojów)
- Maksymalnie 4 pozycje, przewijane
- A/B test: cena pokazana jako "+X zł" vs pełna cena

### 3.5 "Uzupełnij swoją pizzę" (Addon Modal)
Gdy klient wybiera pizzę — przed dodaniem do torby pojawia się **ekran dodatków** z graficzną reprezentacją:

```
┌─────────────────────────────────────────┐
│  🍕 Twoja Margherita                    │
│                                         │
│     [PIZZA GRAFIKA]                     │
│        +🍄 +🧀 +🌶️                      │
│     (dodatki pojawiają się na grafice)  │
│                                         │
│  Dodaj więcej smaku:                    │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │🍄Grzyby│ │🧀Extra │ │🌶️Jalape│      │
│  │  +4 zł │ │ser +5zł│ │ño +3zł │      │
│  │ [+][-] │ │ [+][-] │ │ [+][-] │      │
│  └────────┘ └────────┘ └────────┘      │
│                                         │
│  Cena: 29 zł → 38 zł                    │
│  [🍕 Dodaj do torby]                    │
└─────────────────────────────────────────┘
```

**Triki**:
- Domyślnie zaznaczony najpopularniejszy dodatek (ser, +5 zł)
- Klient musi ODZNACZYć, żeby nie dodać (opt-out zamiast opt-in)
- Grafika pizzy aktualizuje się na żywo (CSS layers z dodatkami)
- "Pakiet smaków" — 3 dodatki za 10 zł zamiast 12 zł (konfigurowalne)

### 3.6 "Dla dwojga / Dla firmy" (Social Upsell)
Przy produktach pojedynczych — sugestia większego wariantu:

```
Margherita 30 cm — 29 zł
Margherita 40 cm — 39 zł  ← "Najpopularniejsza!"
Margherita 50 cm — 49 zł  ← "Dla 2-3 osób, tylko +20 zł!"
                           ↑ badge zachęcający
```

### 3.7 "Dodaj za 1 zł" (Loss Leader)
Konfigurowalna promocja z dashboardu:
- "Dodaj sos czosnkowy za 1 zł" (normalnie 5 zł) — przy zamówieniu powyżej 40 zł
- "Drugi napój za połowę ceny"
- "Deser za 1 zł przy zamówieniu 2 pizz"

Wyświetlane jako **flash banner** nad torem:
```
┌─────────────────────────────────────────┐
│  ⚡ PROMOCJA: Dodaj sos za 1 zł!        │
│     (przy tym zamówieniu)               │
│     [Tak, dodaj!]  [Nie, dzięki]        │
└─────────────────────────────────────────┘
```

---

## 4. MIKRO-ANIMACJE I "BAJERY"

### 4.1 Pulsujące "Gorące" produkty
Produkty, które właśnie ktoś zamówił (lub są bestsellerami) mają subtelny **pulsujący ring** wokół zdjęcia (CSS animation: pulse-border).

### 4.2 Parallax Menu
Przewijanie menu — zdjęcia produktów poruszają się nieco wolniej niż tło (parallax), co dodaje głębi.

### 4.3 "Pizza Builder" (Konfigurator)
Dla kategorii pizza — interaktywny konfigurator:
- Wybór rozmiaru: grafika pizzy rośnie w czasie rzeczywistym
- Wybór ciasta: cienkie (grafika płaska) vs grube (grafika z wysokim brzegiem)
- Dodatki "upuszczane" na pizzę (drag & drop lub tap)
- Podgląd ceny w czasie rzeczywistym (licznik "skaczący" jak w kasynie)

### 4.4 "Szef kuchni poleca" (Badge animowany)
Złota pieczątka z obracającym się tekstem "SZEF POLECA" na wybranych produktach (konfigurowalne z dashboardu).

### 4.5 Countdown na promocje
```
┌─────────────────────────────────────────┐
│  ⏰ PROMOCJA KOŃCZY SIĘ ZA:             │
│     02 : 14 : 33                        │
│     (animacja ticking clock)            │
└─────────────────────────────────────────┘
```
Konfigurowalne z dashboardu: data rozpoczęcia, zakończenia, produkty objęte.

### 4.6 "Twoja pizza jest w trakcie..." (Śledzenie)
Zamiast suchego statusu — **ilustrowany timeline**:
```
[👨‍🍳]──────[🔥]──────[🛵]──────[🏠]
  ↑         ↑         ↑         ↑
Przyjęto  W piecu  W drodze  U Ciebie!
```
Z animacjami: dymek z pizzy, poruszający się skuter, dzwonek do drzwi.

### 4.7 Efekt "Shake" przy błędzie
Gdy użytkownik próbuje zamówić poniżej minimum — torba potrząsa się (CSS shake) z komunikatem:
"Ups! Minimum zamówienia to 40 zł. Dodaj coś jeszcze! 🍕"

### 4.8 "Confetti" przy osiągnięciu progu
Gdy wartość zamówienia przekracza próg darmowej dostawy lub promocji — na ekranie wybuchają małe ikonki (ser, pomidor, bazylia) zamiast standardowego confetti.

---

## 5. KONFIGUROWALNOŚĆ Z DASHBOARDU

Właściciel restauracji ma pełną kontrolę nad wszystkimi "bajerami" bez ingerencji dewelopera.

### 5.1 Panel "Konwersja i Upsell"

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ USTAWIENIA KONWERSJI I UPSELLU                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📦 SMART CROSS-SELL                                        │
│  [✓] Włącz rekomendacje po dodaniu produktu               │
│  Ilość rekomendacji: [3]                                    │
│  Typ: (•) Automatyczne  ( ) Ręczne przypisanie            │
│                                                             │
│  🚚 DARMOWA DOSTAWA                                         │
│  [✓] Włącz prog darmowej dostawy                          │
│  Próg: [60] zł                                              │
│  Produkty podpowiadane: [Cola 1L, Sos czosnkowy]          │
│  Animacja: (•) Termometr  ( ) Pasek postępu               │
│                                                             │
│  🎁 ZESTAWY (BUNDLES)                                       │
│  [Dodaj nowy zestaw]                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Zestaw "Rodzinny" | Rabat: 15% | Status: ✅ Aktywny │   │
│  │ 2x Pizza + 1x Napój 1L + 1x Sos                     │   │
│  │ [Edytuj] [Dezaktywuj] [Statystyki]                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚡ PROMOCJE CZASOWE                                        │
│  [Dodaj promocję]                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ "Sos za 1 zł" | Do: 2024-08-31 | Status: ✅ Aktywna │   │
│  │ Warunek: Zamówienie > 40 zł | Produkt: Sos czosnkowy│   │
│  │ Cena promocyjna: 1 zł                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🏷️ BADGE'Y I ETYKIETY                                      │
│  [✓] "Bestseller" (automatycznie, top 5 sprzedaży)       │
│  [✓] "Nowość" (produkty dodane < 30 dni temu)            │
│  [✓] "Ostatnie sztuki" (przy niskim stanie magazynowym)  │
│  [✓] "Szef poleca" (ręczne przypisanie)                  │
│                                                             │
│  🔔 POWIADOMIENIA TOAST                                     │
│  [✓] "Ktoś w okolicy zamówił..."                          │
│  Częstotliwość: [co 30] sekund                            │
│  Treść szablonu: "Ktoś z {district} zamówił {product}"    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Panel "Wygląd i Animacje"

```
┌─────────────────────────────────────────────────────────────┐
│  🎨 WYGLĄD STRONY                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Ikona koszyka: (•) Torba na pizzę  ( ) Klasyczny koszyk  │
│  Animacja dodawania: (•) Fly-to-bag  ( ) Fade  ( ) Brak   │
│  Motyw: (•) Jasny  ( ) Ciemny  ( ) Auto (systemowy)       │
│                                                             │
│  🍕 KONFIGURATOR PIZZY                                      │
│  [✓] Włącz interaktywny konfigurator                      │
│  [✓] Pokazuj dodatki na grafice pizzy                     │
│                                                             │
│  🎵 DŹWIĘKI                                                 │
│  [✓] Dźwięk dodawania do torby                            │
│  [ ] Dźwięk nowego zamówienia (dla KDS)                   │
│                                                             │
│  🎉 EFEKTY SPECJALNE                                        │
│  [✓] Confetti przy darmowej dostawie                      │
│  [✓] Shake torby przy błędzie minimum                     │
│  [✓] Puls bestsellerów                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Panel "Produkty" (zarządzanie)

```
┌─────────────────────────────────────────────────────────────┐
│  🍕 ZARZĄDZANIE PRODUKTAMI                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Dodaj produkt]  [Import CSV]  [Eksport CSV]               │
│                                                             │
│  Filtruj: [Wszystkie ▼]  [Dostępne ▼]  Szukaj: [______]   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🍕 Margherita                              [✏️] [🗑️]│   │
│  │ Kategoria: Pizze | Cena: 29 zł | Dostępna: ✅      │   │
│  │                                                      │   │
│  │ Warianty:                                            │   │
│  │   Mała 30cm: 29 zł  [Edytuj]                       │   │
│  │   Średnia 40cm: 39 zł [Edytuj]                     │   │
│  │   Duża 50cm: 49 zł [Edytuj]                        │   │
│  │                                                      │   │
│  │ Dodatki:                                             │   │
│  │   Extra ser: +5 zł | Pieczarki: +3 zł              │   │
│  │                                                      │   │
│  │ Upsell:                                              │   │
│  │   Rekomendowane: [Cola 1L], [Sos czosnkowy]        │   │
│  │   Pakiet "Więcej smaku": 3 dodatki za 10 zł        │   │
│  │                                                      │   │
│  │ Badge: [✓] Bestseller  [ ] Nowość  [✓] Szef poleca │   │
│  │                                                      │   │
│  │ 📸 Zdjęcie: [podgląd] [Zmień]                      │   │
│  │                                                      │   │
│  │ [💾 Zapisz zmiany] [Podgląd na stronie]            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚡ ZMIANA CENY (szybka edycja inline):                    │
│  Kliknij cenę → wpisz nową → Enter → Broadcast WS         │
│  [Historia zmian cen] — audyt: kto, kiedy, stara→nowa     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Funkcjonalności**:
- **Inline editing** — kliknij cenę, wpisz nową, Enter. Zmiana natychmiast widoczna na stronie (WebSocket).
- **Bulk edit** — zaznacz wiele produktów, zmień cenę o % lub kwotę.
- **Historia cen** — wykres zmian ceny w czasie (dla analizy).
- **Dostępność** — toggle "Dostępne/Niedostępne" z komunikatem na stronie: "Tymczasowo niedostępne".
- **Kategorie** — drag & drop do zmiany kolejności.

---

## 6. STRUKTURA STRONY GŁÓWNEJ (z torbą)

```
┌─────────────────────────────────────────┐
│  [LOGO]        [MENU]  [🍕 Torba (2)]  │  <- Sticky header
│                              ↑ Torba z  │
│                                licznikiem│
├─────────────────────────────────────────┤
│  🎉 WEEKENDOWA PROMOCJA!                │  <- Hero banner
│     2 pizze + napój = 59 zł!            │
│     [Zamów teraz]                       │
├─────────────────────────────────────────┤
│  📍 Wpisz adres → Sprawdź dostawę       │
├─────────────────────────────────────────┤
│  🔥 SZEF POLECA (pulsujące badge)       │
│  [Pizza 1] [Pizza 2] [Pizza 3]          │
│  (zdjęcia z parallax, hover = zoom)     │
├─────────────────────────────────────────┤
│  🍕 PIZZE    🍝 MAKARONY    🥗 SAŁATKI  │  <- Sticky tabs
│  (przyklejone do góry po scrollu)       │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │ 🍕 Margherita                   │    │
│  │ [ZDJĘCIE]                       │    │
│  │ "Klasyczna, prosta, pyszna"     │    │
│  │ ⭐ 4.8 (120 opinii)             │    │
│  │ 🏆 BESTSELLER (złota pieczątka) │    │
│  │                                 │    │
│  │ Mała 30cm    29 zł              │    │
│  │ Średnia 40cm 39 zł  ← Popularna!│    │
│  │ Duża 50cm    49 zł              │    │
│  │                                 │    │
│  │ [🍕 Konfiguruj i dodaj]         │    │
│  │     ↑ Otwiera modal z dodatkami │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│  ⭐ Opinie (carousel ze zdjęciami)      │
├─────────────────────────────────────────┤
│  📱 Pobierz aplikację (PWA)             │
├─────────────────────────────────────────┤
│  [STOPKA]                               │
└─────────────────────────────────────────┘
│  ┌─────────────────────────────────────┐│
│  │ 🍕 Twoja torba          2 item 78zł ││ <- Sticky bottom
│  │ [Zobacz zamówienie →]              ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## 7. CHECKOUT Z UPSELLEM

### Krok 1: Torba (rozwinięta)
```
┌─────────────────────────────────────────┐
│  🍕 Twoja torba                         │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🍕 Margherita 40cm              │    │
│  │    + Extra ser, + Pieczarki     │    │
│  │    39 zł + 8 zł = 47 zł         │    │
│  │    [🗑️]                         │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 🍕 Capriciosa 40cm              │    │
│  │    39 zł                        │    │
│  │    [🗑️]                         │    │
│  └─────────────────────────────────┘    │
│                                         │
│  💡 Dodaj coś jeszcze?                  │
│  [🥤 Cola 1L +5zł] [🧄 Sos +3zł]       │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  Suma: 86 zł                            │
│  Dostawa: 8 zł                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  RAZEM: 94 zł                           │
│                                         │
│  🔥 Jeszcze 14 zł do darmowej dostawy!  │
│  [Dodaj napój 1.5L za 9 zł]             │
│                                         │
│  [🛒 Przejdź do dostawy →]              │
└─────────────────────────────────────────┘
```

### Krok 2: Dane + Ostatnia szansa
```
┌─────────────────────────────────────────┐
│  Dane dostawy...                        │
│                                         │
│  💡 OSTATNIA SZANSA!                    │
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │🧄Sos │ │🌶️Oliw│ │🍰Deser│            │
│  │+3zł  │ │+2zł  │ │+8zł  │            │
│  └──────┘ └──────┘ └──────┘            │
│                                         │
│  [Zamów i zapłać 94 zł →]               │
└─────────────────────────────────────────┘
```

---

## 8. MOBILE-FIRST INTERAKCJE

- **Swipe** w torbą: przesuń w prawo, aby szybko dodać ostatnio zamawiany produkt
- **Long press** na produkcie: podgląd szczegółów bez wchodzenia w kartę
- **Pull-to-refresh** menu: odświeżenie dostępności
- **Haptic feedback** na każdym dodaniu do torby
- **3D Touch / Force Touch**: szybki podgląd produktu (iOS)

---

## 9. KONFIGURACJA WIDOCZNOŚCI PRODUKTÓW (Dashboard)

Właściciel może w dowolnej chwili:
1. **Zmienić cenę** — inline, natychmiastowy broadcast na stronę
2. **Wyłączyć produkt** — znika ze strony lub pokazuje "Chwilowo niedostępne"
3. **Dodać dodatki** — do każdego produktu (cena, max ilość)
4. **Przypisać upsell** — które produkty rekomendować
5. **Ustawić promocje** — czasowe, warunkowe, procentowe
6. **Zmienić kolejność** — drag & drop kategorii i produktów
7. **Dodać zdjęcie** — upload, crop, optymalizacja
8. **Zarządzać wariantami** — rozmiary, ceny, dostępność

Wszystkie zmiany są **natychmiastowe** (WebSocket) lub z opóźnieniem < 2 sekund.

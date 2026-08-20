# Jak Pracować z AI — Instrukcja

> **Ten plik opisuje jak efektywnie współpracować z AI przy tworzeniu tego projektu.**

---

## 1. Przed każdą sesją AI

### ✅ Checklist

- [ ] Przeczytaj `README-AI.md` (całość)
- [ ] Sprawdź który etap jest aktualny (zob. `docs/etapy.md`)
- [ ] Przygotuj prompt startowy z `prompts/prompt-start.md`
- [ ] Przygotuj prompt aktualnego etapu z `prompts/prompt-etap-XX.md`
- [ ] Upewnij się, że masz dostęp do repo (GitHub)
- [ ] Przygotuj pytania / problemy do omówienia

---

## 2. Jak rozpocząć nową sesję

### Krok 1: Wklej prompt startowy

Otwórz `prompts/prompt-start.md`, skopiuj całą zawartość i wklej jako pierwszą wiadomość do AI.

### Krok 2: Wklej prompt aktualnego etapu

Otwórz odpowiedni `prompts/prompt-etap-XX.md` i wklej jako drugą wiadomość.

### Krok 3: Zadaj pytanie lub poproś o konkretną akcję

Przykłady:
- "Rozpocznijmy Etap 0. Stwórz strukturę monorepo."
- "Mam problem z konfiguracją Prisma. Oto mój schema..."
- "Przejrzyj ten kod i zasugeruj poprawki..."

---

## 3. Limity AI (WAŻNE)

**Maksymalnie 25 kroków na turę.**

Co to oznacza:
- AI może wykonać max 25 akcji (np. zapisywanie plików, komendy, wyszukiwanie) w jednej odpowiedzi
- Jeśli zadanie wymaga więcej — podziel je na części
- Po każdej odpowiedzi AI, TY musisz odpowiedzieć, aby kontynuować

**Jak nie przekroczyć limitu:**
- Dziel duże zadania na mniejsze (np. "Najpierw stwórz strukturę katalogów, potem skonfiguruj TypeScript")
- Nie prosz AI o "stworzenie całego backendu naraz" — dziel na endpointy
- Używaj promptów etapowych — one są zoptymalizowane pod limit

---

## 4. Jak zapisać stan pracy po sesji

Po każdej sesji AI:

1. **Zcommituj zmiany**:
```bash
git add .
git commit -m "feat: opis tego co zrobiono"
```

2. **Zaktualizuj README-AI.md**:
- Dodaj sekcję "Ostatnie zmiany" z datą
- Zapisz co zostało zrobione, co w trakcie, co następne

3. **Zapisz notatki**:
- Co działa ✅
- Co nie działa ❌
- Co do zrobienia w następnej sesji 📝

---

## 5. Jak kontynuować po przerwie

### Scenariusz: Wracasz po 2 dniach

1. Wklej `prompts/prompt-start.md` (zawsze!)
2. Wklej zawartość `README-AI.md` (kontekst)
3. Powiedz AI: "Kontynuujemy pracę. Ostatnio zrobiliśmy [X]. Teraz potrzebuję [Y]."
4. AI przeczyta kontekst i będzie wiedziało co robić

---

## 6. Najlepsze praktyki

### ✅ Rób
- Podawaj konkretne wymagania (np. "Dodaj endpoint POST /orders z walidacją Zod")
- Proś o wyjaśnienia jeśli coś niejasne
- Testuj kod na bieżąco
- Commituj często
- Dziel duże zadania

### ❌ Nie rób
- Nie prosz o "zrobienie całego systemu naraz"
- Nie wklejaj sekretów (hasła, klucze API)
- Nie ignoruj błędów — zatrzymaj się i poproś AI o pomoc
- Nie zmieniaj architektury bez konsultacji

---

## 7. Struktura rozmowy z AI

```
[Ty]  → Prompt startowy + prompt etapu
[AI]  → Potwierdzenie, pytania wyjaśniające
[Ty]  → Odpowiedzi, konkretne zadanie
[AI]  → Kod / rozwiązanie
[Ty]  → Testowanie, feedback
[AI]  → Poprawki
... (powtarzaj aż do akceptacji)
[Ty]  → Commit + aktualizacja README-AI.md
```

---

## 8. Gdy coś idzie nie tak

### AI nie rozumie kontekstu
→ Wklej `README-AI.md` i powiedz "Przeczytaj cały kontekst projektu"

### AI generuje błędny kod
→ Pokaż błąd, powiedz "To nie działa, oto log: [log]"

### AI przekracza limit kroków
→ Powiedz "Podzielmy to. Najpierw zrób [część 1], potem poproszę o resztę"

### AI zapomina o czym rozmawialiśmy
→ Wklej prompt startowy ponownie

---

## 9. Narzędzia wspomagające

- **GitHub** - repo, issues, PR, Actions
- **Figma** - prototypy UX (opcjonalnie)
- **Postman / Insomnia** - testowanie API
- **pgAdmin / DBeaver** - przeglądanie bazy
- **Redis Insight** - przeglądanie Redis

---

*Workflow v1.0 — 2026-08-12*

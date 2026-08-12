# Workflow Pracy z AI — Instrukcja dla Użytkownika

> **Ten plik opisuje jak efektywnie pracować z AI nad projektem, nie przekraczając limitów i zachowując ciągłość pracy.**

---

## 1. Struktura Pracy

Projekt jest podzielony na **9 etapów** (0-8). Każdy etap ma osobny plik promptu w `prompts/`.

```
Sesja AI = prompt-start.md + prompt-etap-XX.md + link do GitHub
```

---

## 2. Jak Rozpocząć Nową Sesję

### Krok 1: Otwórz nowe okno rozmowy z AI

### Krok 2: Wklej zawartość `prompts/prompt-start.md`
To zawsze pierwsza wiadomość. AI od razu wie o co chodzi.

### Krok 3: Wklej zawartość aktualnego etapu
Np. `prompts/prompt-etap-00.md` (Etap 0: Infrastruktura)

### Krok 4: Dodaj kontekst
```
Repo: https://github.com/gamerpolska123-collab/WebowoROS
Aktualny etap: Etap 0 — Infrastruktura
Ostatnio zrobione: (sprawdź README-AI.md sekcja "Stan projektu")
```

### Krok 5: AI zaczyna pracę
AI przeczyta README-AI.md i docs/ z repo, a następnie wykona zadania.

---

## 3. Limity AI (25 kroków na turę)

Każdy prompt etapu jest zaprojektowany tak, aby zmieścić się w **1-3 turach** (max 75 kroków).

| Etap | Szacowane tury | Dlaczego tyle |
|------|----------------|---------------|
| 0 — Infrastruktura | 2-3 | Dużo plików konfiguracyjnych |
| 1 — Design System | 2-3 | Komponenty UI |
| 2 — Backend | 3-4 | Schema + API + testy |
| 3 — Frontend | 3-4 | Strony + animacje |
| 4 — Dashboard | 2-3 | Panele zarządzania |
| 5 — KDS + Drukarki | 2 | KDS + szablony wydruków |
| 6 — Płatności | 2 | Stripe + PayU + security |
| 7 — Deployment | 2 | Docker + RPi + monitoring |
| 8 — Testy | 1-2 | Checklisty + dokumentacja |

**Jeśli etap jest zbyt duży** — podziel go na 2 sesje:
- Sesja 1: Zadania 1-3
- Sesja 2: Zadania 4-6 (wklej ten sam prompt + dopisz "kontynuuj od zadania 4")

---

## 4. Zasady Podziału na Pliki

Każdy plik max **200 linii**. Dziel na małe moduły:

```
❌ ZŁO:
  apps/api/src/products/products.controller.ts (800 linii)

✅ DOBRZE:
  apps/api/src/products/products.controller.ts (80 linii)
  apps/api/src/products/products.service.ts (120 linii)
  apps/api/src/products/products.repository.ts (100 linii)
  apps/api/src/products/dto/create-product.dto.ts (30 linii)
  apps/api/src/products/dto/update-product.dto.ts (20 linii)
```

---

## 5. Jak Zapisać Stan Pracy

Po KAŻDEJ sesji AI zaktualizuje `README-AI.md` w repo:

```markdown
## 4. STAN PROJEKTU

✅ Dokumentacja: Kompletna
✅ Etap 0 — Kod: Zakończony (2026-08-15)
✅ Etap 1 — Kod: Zakończony (2026-08-18)
🔄 Etap 2 — Kod: W trakcie (zrobione: schema Prisma, migracje, seedery; 
   pozostało: API endpoints, WebSocket, testy)
❌ Etap 3-8: Nie rozpoczęte

### Ostatnia sesja: 2026-08-20
### Wykonane w ostatniej sesji:
- Schema Prisma (Category, Product, Variant, ProductAddon, Order, OrderItem, User)
- Migracja init
- Seeder z przykładowym menu (10 pizz, 5 makaronów, 3 zupy, 8 napojów)

### Problemy / Decyzje do podjęcia:
- Czy użyć BullMQ czy custom Redis Queue dla drukarek?

### Pliki zmienione w ostatniej sesji:
- apps/api/prisma/schema.prisma
- apps/api/prisma/seed.ts
- apps/api/prisma/migrations/...
```

**Commit po każdej sesji:**
```bash
git add .
git commit -m "feat(api): add Prisma schema, migrations and seeders

- Full ERD with all models
- Sample menu data
- Upsell config seeders

Refs: Etap 2, sesja 1/3"
git push
```

---

## 6. Jak Kontynuować Po Przerwie

### Scenariusz: Przerwałeś pracę w środku Etapu 2

1. Sprawdź `README-AI.md` w repo — sekcja "Stan projektu"
2. Otwórz nowe okno AI
3. Wklej `prompt-start.md`
4. Wklej `prompt-etap-02.md`
5. Dodaj: "Kontynuuj od Zadania 4 (WebSocket Gateway). Zadania 1-3 są zrobione."
6. AI przeczyta repo, zobaczy co jest zrobione i kontynuuje od Zadania 4

---

## 7. Stack — 100% Legalny do Odsprzedaży

Wszystkie technologie są na licencjach open-source (MIT/Apache/BSD):
- Next.js, React, TypeScript, Tailwind, shadcn/ui
- NestJS, Prisma, PostgreSQL, Redis (lub Valkey)
- Socket.io, node-escpos, Zod
- Docker, Nginx, pnpm, Turborepo

Usługi zewnętrzne (Stripe, PayU, Google Maps) — klient płaci bezpośrednio, nie ty.
Szczegóły w `docs/licencje.md`.

---

## 8. Checklist Przed Każdą Sesją

- [ ] `git pull` — pobierz najnowsze zmiany z repo
- [ ] Przeczytaj `README-AI.md` — sprawdź stan
- [ ] Wklej `prompt-start.md` do nowego okna AI
- [ ] Wklej aktualny `prompt-etap-XX.md`
- [ ] Dodaj kontekst: "Kontynuuj od zadania X"
- [ ] Po sesji: `git commit` + `git push`
- [ ] Zaktualizuj `README-AI.md` w repo

---

## 9. Kontakt i Wsparcie

Jeśli AI napotka problem, którego nie potrafi rozwiązać:
1. Zapisz stan pracy (commit)
2. Zanotuj problem w `README-AI.md`
3. W następnej sesji opisz problem na początku promptu
4. Lub: skonsultuj się z programistą (Stack Overflow, Discord NestJS/Next.js)

---

*Workflow v1.0 — 2026-08-12*

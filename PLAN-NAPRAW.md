# PLAN-NAPRAW.md
## Plan napraw WebowoROS — aktualizacja 2026-08-18 (sesja 7)

> **UWAGA**: 18/24 problemów wysokich i 11/11 krytycznych zostało naprawionych.
> Pozostało 6 problemów wysokich (W4, W5, W6, W10, W12, W13) i 3 średnie.

---

## ✅ ZROBIONE (nie wymaga dalszej pracy)

### FAZA 1 — KRYTYCZNE (11/11):
K1-K11 wszystkie naprawione.

### FAZA 2 — WYSOKIE (18/24):
W1, W2, W3, W7, W8, W9, W14, W15, W16, W17, W18, W19, W20, W21, W22, W23, W24 + W11 (false positive)

### FAZA 3 — ŚREDNIE (2/5):
S1 (README-AI.md ostrzeżenie), S2 (usunięto duplikaty)

---

## ⬜ DO ZROBIENIA — PRIORYTETY DLA NASTĘPNEJ AI

### PRIORYTET 1: W5 — Checkout z API (najważniejsze dla UX)
**Pliki:** `apps/web/app/checkout/page.tsx`, `apps/web/lib/use-create-order.ts`
**Co zrobić:**
1. W `checkout/page.tsx` — zamienić mock data na prawdziwe wywołania API
2. Użyć `useCreateOrder` hooka (już istnieje)
3. Po sukcesie — `router.push(\`/track/${order.id}\`)`
4. Dodać obsługę błędów (toast zamiast alert)
5. Zintegrować z płatnościami (Stripe/PayU) lub dodać opcję "płatność przy odbiorze"

### PRIORYTET 2: W6 — Sync koszyka z API
**Pliki:** `apps/web/lib/cart-context.tsx`, `apps/api/src/orders/orders.controller.ts`
**Co zrobić:**
1. Dodać endpointy API dla koszyka (GET /cart, POST /cart/sync)
2. W `cart-context.tsx` — po zalogowaniu fetch koszyka z API
3. Przy każdej zmianie koszyka — sync do API (dla zalogowanych)
4. Przy wylogowaniu — zapisz do localStorage

### PRIORYTET 3: W4 — Warianty/addony w formularzu produktu
**Pliki:** `apps/dashboard/app/products/components/product-form-modal.tsx`
**Co zrobić:**
1. Rozszerzyć formularz o sekcje "Warianty" i "Dodatki"
2. Dodać dynamiczne pola dla wariantów (nazwa, priceAdjustment)
3. Dodać dynamiczne pola dla addonów (nazwa, cena, maxQuantity)
4. Zaktualizować API admina do obsługi tych relacji

### PRIORYTET 4: W10 — Płatności Stripe/PayU
**Pliki:** `apps/api/src/payments/*`, `apps/web/app/checkout/*`
**Co zrobić:**
1. Zaimplementować `payments.service.ts` — integracja Stripe
2. Dodać webhook Stripe do aktualizacji statusu zamówienia
3. Dodać frontendowe komponenty płatności

### PRIORYTET 5: W12, W13 — Drobnostki backend
**W12:** Zamienić ręczną weryfikację JWT w gateway na `@UseGuards(WsJwtGuard)`
**W13:** Dodać `app.useGlobalPipes(new ZodValidationPipe())` w `main.ts`

---

## ZASADY KODOWANIA (MUSI BYĆ PRZESTRZEGANE)

- TypeScript strict mode włączony
- Kod: ANGIELSKI, UI: POLSKI
- Commity: Conventional Commits po angielsku
- Nie pokazuj kodu w odpowiedziach (chyba że użytkownik prosi)
- Pracuj powoli i dokładnie
- Sprawdzaj co już jest zrobione

---

*Ostatnia aktualizacja: 2026-08-18 (sesja 7)*

# PROMPT: ETAP 1 — Design System i Komponenty

Wykonaj ETAP 1 projektu Restaurant Order System.

## Cel
Stwórz Design System i kluczowe komponenty UI w `packages/ui/`.

## Zadania:

### Zadanie 1: Design Tokens
- `packages/ui/src/tokens/colors.ts` — paleta (primary, secondary, accent, dark, light, gold, danger)
- `packages/ui/src/tokens/typography.ts` — font sizes, weights, line heights
- `packages/ui/src/tokens/spacing.ts` — spacing scale
- `packages/ui/src/tokens/animations.ts` — durations, easings

### Zadanie 2: Komponenty shadcn/ui (bazowe)
- Zainstaluj shadcn/ui w `packages/ui` (Button, Card, Dialog, Input, Badge, Tabs, Toast)

### Zadanie 3: Komponenty custom (pizza-specific)
- `PizzaBag.tsx` — torba dostawcza z 4 stanami (empty, light, medium, full)
- `ProductCard.tsx` — karta produktu z badge'ami (bestseller, chef_choice, new)
- `FlyToBag.tsx` — animacja fly-to-bag (CSS bezier + particles)
- `UpsellModal.tsx` — modal cross-sell (3 rekomendacje)
- `BundleBuilder.tsx` — kreator zestawów (sloty z kategoriami)
- `FreeDeliveryProgress.tsx` — termometr gamifikacji
- `AddonConfigurator.tsx` — dodatki na grafice pizzy (CSS layers)
- `CheckoutTimeline.tsx` — kroki checkoutu (torba → dane → płatność)

### Zadanie 4: Strony prototypowe (bez API)
- `apps/web/app/page.tsx` — strona główna z mock menu
- `apps/web/app/bag/page.tsx` — ekran torby
- `apps/web/app/checkout/page.tsx` — checkout (3 kroki)
- `apps/dashboard/app/page.tsx` — dashboard admina (layout)

### Zadanie 5: Animacje CSS
- `packages/ui/src/styles/animations.css` — fly-to-bag, shake, pulse, confetti, squash-stretch

## Po zakończeniu:
ZAPISZ STAN PRACY w README-AI.md:
- "Etap 1 — Kod: Zakończony"
- Lista komponentów + status
- Zrzut ekranu / opis wyglądu (jeśli możliwe)

Nie przechodź do Etapu 2 bez mojej zgody.
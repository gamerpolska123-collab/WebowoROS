# PROMPT: ETAP 6 — Płatności i Bezpieczeństwo

Wykonaj ETAP 6 projektu Restaurant Order System.

## Cel
Bezpieczne płatności online + pełne zabezpieczenie systemu.

## Zadania:

### Zadanie 1: Integracja Stripe
- `apps/api/src/payments/stripe.service.ts` — Stripe SDK
- `POST /payments/stripe/create-intent` — tworzenie PaymentIntent
- `POST /payments/stripe/webhook` — obsługa webhooków (payment_intent.succeeded, payment_intent.payment_failed)
- Stripe Elements na froncie (iframe, bez dotykania danych kart)
- 3D Secure dla nowych klientów

### Zadanie 2: Integracja PayU
- `apps/api/src/payments/payu.service.ts` — PayU REST API
- `POST /payments/payu/create-order` — tworzenie zamówienia PayU
- `POST /payments/payu/notify` — obsługa notyfikacji PayU
- BLIK (jeśli dostępny w API PayU)

### Zadanie 3: Płatność przy Odbiorze
- `POST /orders` z `paymentMethod: "cash_on_delivery"`
- Osobny flow bez przekierowania do płatności online

### Zadanie 4: HTTPS + SSL
- `infra/nginx/nginx.conf` — konfiguracja SSL (Let's Encrypt)
- `infra/docker/docker-compose.prod.yml` — certbot + auto-renewal
- Przekierowanie HTTP → HTTPS
- HSTS header

### Zadanie 5: Security Headers + Rate Limiting
- `helmet()` w NestJS (CSP, X-Frame-Options, HSTS)
- `@nestjs/throttler` — rate limiting (10 req/min na endpoint, 3 próby logowania/min)
- Zod walidacja na WSZYSTKICH endpointach
- `class-validator` + `class-transformer`

### Zadanie 6: RODO / GDPR
- `apps/web/app/privacy/page.tsx` — polityka prywatności (szablon)
- `apps/web/app/terms/page.tsx` — regulamin (szablon)
- Cookie banner (funkcjonalne bez zgody, analityczne/marketingowe z zgodą)
- `DELETE /me` — prawo do zapomnienia (soft delete + anonymizacja po 30d)
- `GET /me/data-export` — eksport danych (JSON)

### Zadanie 7: Backup Bazy
- `infra/scripts/backup.sh` — pg_dump + gzip
- Cron job (codziennie o 3:00)
- Upload backupów do chmury (rclone / restic — opcjonalnie)

## Po zakończeniu:
ZAPISZ STAN PRACY w README-AI.md:
- "Etap 6 — Kod: Zakończony"
- Testy płatności end-to-end (środowisko testowe Stripe)
- Wynik audytu SSL (SSL Labs)

Nie przechodź do Etapu 7 bez mojej zgody.
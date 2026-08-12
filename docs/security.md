# Bezpieczeństwo i Zgodność

## 1. Model zagrożeń (Threat Model)

### Aktorzy i wektory ataku
| Aktor | Motywacja | Wektor ataku |
|-------|-----------|--------------|
| Hobbysta / Script Kiddie | Fame, chaos | SQL Injection, XSS, brute-force |
| Konkurencja | Sabotaż, kradzież danych | DDoS, scraping cen, fake orders |
| Cyberprzestępca | Finansowy | Kradzież danych kart, ransomware |
| Insider (były pracownik) | Zemsta | Nieautoryzowany dostęp do dashboardu |

---

## 2. Warstwy zabezpieczeń (Defense in Depth)

```
┌─────────────────────────────────────────┐
│  Warstwa 1: Sieć (Nginx + Cloudflare*)  │
│  - WAF, DDoS protection, Rate limiting  │
├─────────────────────────────────────────┤
│  Warstwa 2: Aplikacja (NestJS)          │
│  - Input validation, AuthZ, AuthN       │
├─────────────────────────────────────────┤
│  Warstwa 3: Baza danych (PostgreSQL)    │
│  - Row Level Security, encrypted fields │
├─────────────────────────────────────────┤
│  Warstwa 4: Infrastruktura (Docker)     │
│  - Network isolation, non-root users    │
├─────────────────────────────────────────┤
│  Warstwa 5: Fizyczna (Raspberry Pi)     │
│  - UPS, obudowa, SSH keys only          │
└─────────────────────────────────────────┘
```

---

## 3. Autentykacja i autoryzacja

### JWT + HttpOnly Cookies
```
[Client] ──(login)──► [API] 
                        │
                        ▼
              ┌─────────────────┐
              │  Generate:      │
              │  - Access Token │ (15 min, HttpOnly, Secure, SameSite=Strict)
              │  - Refresh Token│ (7 dni, HttpOnly, Secure, SameSite=Strict)
              └─────────────────┘
```

**Dlaczego nie LocalStorage?**
- LocalStorage jest podatny na XSS (skrypt może odczytać token)
- HttpOnly cookie jest niedostępne z poziomu JavaScript

### RBAC (Role-Based Access Control)

```typescript
// Przykład dekoratora w NestJS
@Roles('admin', 'kitchen')
@UseGuards(JwtAuthGuard, RolesGuard)
@Patch('orders/:id/status')
async updateStatus(...) { }
```

---

## 4. Ochrona przed najczęstszymi atakami

### OWASP Top 10

| # | Zagrożenie | Środek zaradczy |
|---|------------|-----------------|
| 1 | Broken Access Control | RBAC, middleware autoryzacji, validate UUID params |
| 2 | Cryptographic Failures | bcrypt (cost=12), AES-256 dla PII, TLS 1.3 |
| 3 | Injection | Prisma ORM (parametrized queries), Zod validation |
| 4 | Insecure Design | Outbox pattern dla zamówień, idempotency keys |
| 5 | Security Misconfiguration | Security headers (Helmet), hide stack traces in prod |
| 6 | Vulnerable Components | Dependabot, Snyk, regularne `npm audit` |
| 7 | Auth Failures | Strong password policy, rate limiting login |
| 8 | Integrity Failures | Signed webhooks (Stripe), checksums |
| 9 | Logging Failures | Structured logs, nie logujemy haseł/tokenów |
| 10 | SSRF | Whitelist URLi, nie pobieraj z user-input URL |

### Szczegółowe zabezpieczenia

#### Rate Limiting
```typescript
// NestJS Throttler
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10, // 10 req/min na endpoint
    }),
  ],
})
```

#### Input Validation (Zod)
```typescript
const OrderSchema = z.object({
  phone: z.string().regex(/^\+48[0-9]{9}$/),
  email: z.string().email(),
  totalAmount: z.number().positive().max(1000), // sanity check
});
```

#### Security Headers (Helmet)
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // dla Next.js
      imgSrc: ["'self'", "data:", "https://cdn.domena.pl"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));
```

---

## 5. Płatności i PCI DSS

### Zasada: Nigdy nie przechowuj danych kart

Używamy **Stripe Elements** lub **PayU Hosted Form** - dane kart wprowadzane są bezpośrednio na iframe dostawcy płatności. Nasz serwer widzi tylko token (np. `pi_123456`).

### Webhook security
```typescript
// Weryfikacja podpisu Stripe
const sig = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  request.body, 
  sig, 
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### Idempotency
Każde zamówienie ma `idempotency_key` (UUID generowany po stronie klienta). API odrzuca duplikaty w ciągu 24h.

---

## 6. RODO / GDPR

### Zbierane dane (legal basis: contract + consent)
| Dane | Cel | Okres przechowywania |
|------|-----|---------------------|
| Imię, nazwisko | Realizacja zamówienia | 2 lata (przedawnienie roszczeń) |
| Adres dostawy | Dostawa | 2 lata |
| Telefon | Kontakt w sprawie dostawy | 2 lata |
| Email | Potwierdzenie, marketing* | 2 lata / do wycofania zgody |
| Historia zamówień | Obsługa reklamacji | 2 lata |

*Marketing wymaga osobnej zgody (checkbox niezaznaczony domyślnie).

### Prawa użytkownika
- **Prawo dostępu** - endpoint `/me/data-export` (JSON z wszystkimi danymi)
- **Prawo do sprostowania** - edycja profilu
- **Prawo do usunięcia** - `DELETE /me` (soft delete + anonymization po 30 dniach)
- **Prawo do przenoszenia** - eksport CSV/JSON

### Cookies
- Funkcjonalne (sessja, koszyk) - nie wymagają zgody
- Analityczne (Google Analytics) - wymagają zgody (banner)
- Marketingowe (Meta Pixel) - wymagają zgody

---

## 7. Bezpieczeństwo drukarek

Drukarki termiczne podłączone przez USB do Raspberry Pi:
- **Izolacja sieciowa**: Printer Service działa w osobnym kontenerze, bez dostępu do internetu
- **Brak przechowywania**: Wydruki nie są zapisywane na dysku (tylko w pamięci)
- **Fizyczna kontrola**: Drukarki w strefie kuchni, dostęp tylko dla personelu

---

## 8. Monitoring bezpieczeństwa

### Logi do monitorowania
- Nieudane próby logowania (alert przy > 5 w ciągu 5 min)
- Zmiany cen (audyt - kto, kiedy, stara cena, nowa cena)
- Anulowania zamówień (szczególnie po płatności)
- Dostęp do dashboardu z nowych IP
- Błędy 500 (potencjalne próby exploitacji)

### Alerting
```bash
# Przykład alertu (Prometheus Alertmanager)
groups:
- name: security
  rules:
  - alert: HighLoginFailures
    expr: rate(login_failures_total[5m]) > 5
    for: 1m
    labels:
      severity: warning
    annotations:
      summary: "Wysoka liczba nieudanych logowań"
```

---

## 9. Checklist przed uruchomieniem produkcyjnym

- [ ] Wszystkie hasła zmienione z domyślnych
- [ ] SSH tylko kluczami, port niestandardowy
- [ ] Firewall (ufw) - tylko porty 22, 80, 443
- [ ] SSL z oceną A+ (SSL Labs)
- [ ] `X-Frame-Options: DENY` (brak embedowania w iframe)
- [ ] `Content-Security-Policy` skonfigurowane
- [ ] Rate limiting włączone na wszystkich endpointach
- [ ] Backupy automatyczne i testowane
- [ ] Polityka prywatności i regulamin opublikowane
- [ ] Zgody RODO zaimplementowane
- [ ] Test penetracyjny (podstawowy) wykonany
- [ ] Dokumentacja incydentów (runbook)

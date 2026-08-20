# Bezpieczeństwo Systemu

## 1. Model zagrożeń (Threat Model)

| Zagrożenie | Prawdopodobieństwo | Wpływ | Środek ochrony |
|------------|-------------------|-------|----------------|
| SQL Injection | Niskie | Krytyczny | Prisma ORM (prepared statements) |
| XSS | Niskie | Wysoki | HttpOnly cookies, CSP headers |
| CSRF | Niskie | Średni | SameSite=Strict cookies |
| Brute force | Średnie | Średni | Rate limiting, fail2ban |
| Man-in-the-middle | Niskie | Krytyczny | HTTPS/TLS 1.3 |
| DDoS | Niskie | Wysoki | Rate limiting, Nginx, Cloudflare (opcjonalnie) |
| Wyciek danych | Niskie | Krytyczny | Szyfrowanie w spoczynku, minimalizacja danych |
| Nieautoryzowany dostęp | Średnie | Krytyczny | RBAC, JWT, strong passwords |

---

## 2. Defense in Depth

### Warstwa 1: Sieć
- **HTTPS wymuszony** - Nginx redirect 80→443
- **TLS 1.3** - minimalna wersja
- **HSTS header** - Strict-Transport-Security: max-age=31536000; includeSubDomains
- **CSP** - Content-Security-Policy ograniczająca źródła skryptów
- **Rate Limiting** - Nginx: 100 req/min per IP

### Warstwa 2: Aplikacja
- **Helmet.js** - bezpieczne nagłówki HTTP
- **CORS** - tylko dozwolone domeny
- **Input validation** - Zod na wszystkich endpointach
- **Output encoding** - automatyczne przez React/Next.js

### Warstwa 3: Autentykacja
- **bcrypt** - cost factor 12
- **JWT** - RS256 (asymetryczny), 15 min expiry
- **Refresh tokens** - 7 dni, rotowane przy każdym użyciu
- **HttpOnly + Secure + SameSite=Strict** cookies
- **Max 5 nieudanych prób logowania** - blokada 15 min

### Warstwa 4: Autoryzacja
- **RBAC** - role: guest, customer, kitchen, driver, admin
- **Middleware** - sprawdzanie uprawnień na każdym endpoincie
- **Resource ownership** - użytkownik widzi tylko swoje zamówienia

### Warstwa 5: Baza danych
- **Prisma ORM** - eliminacja SQL injection
- **Connection pooling** - max 20 połączeń
- **SSL do bazy** - wymuszony w produkcji

### Warstwa 6: Infrastruktura
- **Fail2ban** - blokowanie ataków brute-force
- **UFW** - firewall, tylko potrzebne porty
- **SSH** - tylko klucze, port niestandardowy
- **Docker** - non-root user w kontenerach
- **Automatyczne aktualizacje** - security patches

---

## 3. Płatności (PCI DSS)

**Zasada**: NIGDY nie przechowuj danych kart płatniczych.

- **Stripe** - dane kart na serwerach Stripe (SAQ-A compliant)
- **3D Secure** - wymuszony dla transakcji > 50 zł
- **Webhook verification** - weryfikacja podpisu Stripe
- **Idempotency keys** - uniknięcie podwójnych obciążeń

### Webhook Security
```typescript
// Weryfikacja podpisu Stripe
const event = stripe.webhooks.constructEvent(
  payload,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

---

## 4. RODO / GDPR

### Dane osobowe (przechowywane minimalnie)
- Imię, nazwisko, adres, telefon, email
- Historia zamówień
- **NIE przechowujemy**: danych kart, PESEL, NIP (chyba że klient żąda faktury)

### Prawa użytkownika
- **Prawo do wglądu** - eksport danych (CSV/JSON)
- **Prawo do usunięcia** - anonymization (soft delete + wymazanie danych po 90 dniach)
- **Prawo do poprawek** - edycja profilu
- **Prawo do sprzeciwu** - opt-out z marketingu

### Polityka prywatności
- Wymagana na stronie (link w footer)
- Zgoda na cookies (banner)
- Informacja o przetwarzaniu danych

---

## 5. Backup i Disaster Recovery

### Strategia 3-2-1
- **3** kopie danych
- **2** różne media
- **1** offsite (chmura)

### Automatyczny backup (cron)
```bash
# Codziennie o 3:00
docker exec ros-postgres pg_dump -U ros_user restaurant_db | gzip > /backups/db_$(date +%F).sql.gz

# Sync do chmury (rclone)
rclone sync /backups remote:ros-backups

# Retencja: 7 dni lokalnie, 30 dni w chmurze
find /backups -type f -mtime +7 -delete
```

### Test restore
- Co miesiąc: przywrócenie backupu na testowej bazie
- Weryfikacja integralności danych

---

## 6. Monitoring bezpieczeństwa

- **Logi** - wszystkie żądania API (IP, timestamp, endpoint, status)
- **Failed logins** - alert przy > 10 nieudanych prób/h
- **Payment failures** - alert przy > 5% failed transactions
- **Unusual activity** - alert przy zamówieniach z nowego IP o wysokiej wartości

---

## 7. Checklist bezpieczeństwa przed uruchomieniem

- [ ] HTTPS z A+ na SSL Labs
- [ ] Wszystkie endpointy wymagają autentykacji (poza /menu)
- [ ] Rate limiting aktywne
- [ ] CSP headers skonfigurowane
- [ ] .env nie w repo
- [ ] Hasła: min. 12 znaków, złożone
- [ ] Backup działa i był testowany
- [ ] Fail2ban aktywny
- [ ] SSH tylko klucze, niestandardowy port
- [ ] Docker non-root
- [ ] Polityka prywatności opublikowana
- [ ] Cookies banner działa
- [ ] Webhooki weryfikowane
- [ ] Penetration test (opcjonalnie, zalecane)

---

*Security v1.0 — 2026-08-12*

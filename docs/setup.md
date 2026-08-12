# Instrukcja Instalacji

## 1. Wymagania wstępne

### Lokalnie (Development)
- Node.js 20+ (zalecany: via nvm)
- pnpm 8+
- Docker + Docker Compose
- Git

### Produkcja (Raspberry Pi 4)
- Raspberry Pi 4 (4GB/8GB RAM)
- SSD USB 3.0 128GB+
- Zasilacz 5V/3A
- Dostęp do routera (Ethernet preferowany)
- Domena + dostęp do DNS (dla SSL)

---

## 2. Setup lokalny (Development)

### Krok 1: Klonowanie repozytorium

```bash
git clone https://github.com/gamerpolska123-collab/WebowoROS
cd restaurant-order-system
```

### Krok 2: Instalacja zależności

```bash
# Instalacja pnpm (jeśli nie masz)
npm install -g pnpm

# Instalacja wszystkich pakietów (monorepo)
pnpm install
```

### Krok 3: Konfiguracja środowiska

```bash
# Skopiuj pliki env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local

# Edytuj .env files z własnymi wartościami
# Wymagane minimum:
# - DATABASE_URL
# - JWT_SECRET (generuj: openssl rand -base64 32)
# - STRIPE_SECRET_KEY (lub PAYU dla testów)
```

### Krok 4: Uruchomienie infrastruktury (baza, redis)

```bash
cd infra/docker
docker-compose up -d postgres redis

# Sprawdzenie statusu
docker-compose ps
```

### Krok 5: Migracje i seedery

```bash
cd apps/api
pnpm prisma migrate dev
pnpm prisma db seed
```

### Krok 6: Uruchomienie aplikacji

```bash
# Z root projektu (Turborepo uruchomi wszystko)
pnpm dev

# Lub osobno w terminalach:
# Terminal 1: cd apps/api && pnpm start:dev
# Terminal 2: cd apps/web && pnpm dev
# Terminal 3: cd apps/dashboard && pnpm dev
```

### Krok 7: Dostęp do aplikacji

| Aplikacja | URL | Uwagi |
|-----------|-----|-------|
| Strona klienta | http://localhost:3000 | |
| Dashboard | http://localhost:3001 | Login: admin@example.com / admin123 |
| API Docs | http://localhost:4000/api | Swagger UI |
| WebSocket | ws://localhost:4001 | Socket.io test |
| PostgreSQL | localhost:5432 | DBeaver/pgAdmin |
| Redis | localhost:6379 | Redis Insight |

---

## 3. Setup produkcyjny (Raspberry Pi 4)

### Krok 1: Przygotowanie Raspberry Pi

Zobacz szczegóły w [`hardware.md`](./hardware.md). Skrót:

```bash
# Na Raspberry Pi (po instalacji OS i Docker)
mkdir -p ~/ros-project
cd ~/ros-project
```

### Krok 2: Przygotowanie plików konfiguracyjnych

```bash
# Stwórz strukturę katalogów
mkdir -p nginx/ssl nginx/www data/postgres data/redis backups

# Skopiuj pliki z repozytorium
git clone https://github.com/gamerpolska123-collab/WebowoROS src
cp src/infra/docker/docker-compose.prod.yml ./docker-compose.yml
cp src/infra/nginx/nginx.conf ./nginx/
```

### Krok 3: Konfiguracja .env

```bash
# .env (chmod 600!)
cat > .env <<EOF
# Baza danych
DB_USER=ros_prod_user
DB_PASSWORD=$(openssl rand -base64 24)
DB_NAME=restaurant_prod

# JWT
JWT_SECRET=$(openssl rand -base64 32)

# Płatności
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayU (alternatywa)
PAYU_CLIENT_ID=...
PAYU_CLIENT_SECRET=...

# Domena
DOMAIN=twojadomena.pl
EOF

chmod 600 .env
```

### Krok 4: SSL (Let's Encrypt)

```bash
# Instalacja certbot
docker run -it --rm   -v $(pwd)/nginx/www:/var/www/certbot   -v $(pwd)/nginx/ssl:/etc/letsencrypt   certbot/certbot certonly   --webroot -w /var/www/certbot   -d twojadomena.pl -d www.twojadomena.pl

# Auto-renewal (cron)
echo "0 3 * * * docker run --rm -v $(pwd)/nginx/www:/var/www/certbot -v $(pwd)/nginx/ssl:/etc/letsencrypt certbot/certbot renew --quiet" | crontab -
```

### Krok 5: Pierwsze uruchomienie

```bash
# Pobranie obrazów
docker-compose pull

# Uruchomienie
docker-compose up -d

# Sprawdzenie logów
docker-compose logs -f api

# Migracja bazy (pierwszy raz)
docker-compose exec api npx prisma migrate deploy

# Seed danych (opcjonalnie)
docker-compose exec api npx prisma db seed
```

### Krok 6: Weryfikacja

```bash
# Status kontenerów
docker-compose ps

# Test API
curl https://twojadomena.pl/api/health

# Test strony
curl -I https://twojadomena.pl
```

---

## 4. Aktualizacje (Deployment)

### Automatyczny deployment (GitHub Actions)

Po pushu do brancha `main`:
1. GitHub Actions buduje obrazy i pushuje do GitHub Container Registry
2. Watchtower na Raspberry Pi co godzinę sprawdza nowe wersje
3. Automatyczny restart kontenerów z nowym obrazem

### Ręczny deployment

```bash
cd ~/ros-project

# Pobranie najnowszych obrazów
docker-compose pull

# Zatrzymanie i uruchomienie (zero-downtime dla Nginx)
docker-compose up -d

# Sprawdzenie
docker-compose ps
docker-compose logs -f --tail=100
```

### Rollback

```bash
# Jeśli nowa wersja ma błędy
docker-compose down

# Użycie poprzedniego taga
export TAG=previous-stable
docker-compose pull
docker-compose up -d
```

---

## 5. Troubleshooting

### Problem: Strona nie ładuje się
```bash
# Sprawdź Nginx
docker-compose logs nginx

# Sprawdź czy web działa
docker-compose exec web wget -qO- http://localhost:3000

# Sprawdź firewall
sudo ufw status
```

### Problem: Błąd połączenia z bazą
```bash
# Sprawdź czy postgres działa
docker-compose exec postgres pg_isready -U ros_prod_user

# Sprawdź logi
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### Problem: Drukarka nie drukuje
```bash
# Sprawdź czy drukarka jest widoczna
ls -la /dev/usb/lp*

# Sprawdź logi printer-service
docker-compose logs printer-service

# Restart serwisu
docker-compose restart printer-service
```

### Problem: Wysokie zużycie RAM
```bash
# Sprawdź
docker stats

# Ograniczenia są w docker-compose.prod.yml
# Jeśli potrzeba więcej RAM - przejdź na Raspberry Pi 8GB
```

---

## 6. Użytkownicy testowi (po seedzie)

| Rola | Email | Hasło |
|------|-------|-------|
| Admin | admin@example.com | Admin123! |
| Kuchnia | kitchen@example.com | Kitchen123! |
| Kierowca | driver@example.com | Driver123! |
| Klient | customer@example.com | Customer123! |

> **WAŻNE**: Zmień hasła przed uruchomieniem produkcyjnym!

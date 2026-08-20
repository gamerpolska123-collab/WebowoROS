# Docker — Deployment Guide

## Architektura kontenerów

WebowoROS jest zbudowane jako zestaw niezależnych kontenerów Docker, gotowych do deployu na jednym hoście (dev/Raspberry Pi) lub rozproszonych na 2-3 serwery (Docker Swarm).

### Serwisy

| Serwis | Port | Rola | Wymagania |
|--------|------|------|-----------|
| **nginx** | 80/443 | Reverse proxy, SSL, load balancing | Manager node |
| **api** | 4000/4001 | NestJS backend + WebSocket | Manager node |
| **web** | 3000 | Next.js — strona klienta | Frontend node |
| **dashboard** | 3001 | Next.js — panel admina | Manager node |
| **postgres** | 5432 | PostgreSQL 16 | Data node |
| **redis** | 6379 | Redis 7 (cache + pub/sub) | Frontend node |
| **printer-service** | 5000 | Drukarka ESC/POS | Data node |

### Sieć

Wszystkie serwisy komunikują się przez wewnętrzną sieć Docker:
- **Dev/Prod**: `ros-net` (bridge)
- **Swarm**: `ros-overlay` (overlay, attachable)

Frontendy (web, dashboard) NIE używają `localhost` — używają nazw serwisów (`api:4000`, `redis:6379`).

---

## Tryby deployu

### 1. Development (Docker Desktop / lokalnie)

```bash
cd infra/docker
docker-compose up -d
```

Dostępne pod:
- Web: http://localhost:3000
- Dashboard: http://localhost:3001
- API: http://localhost:4000/v1
- WS: ws://localhost:4001

### 2. Production (single host, Raspberry Pi)

```bash
cd infra/docker
cp .env.example .env
# Edytuj .env — ustaw JWT_SECRET, DB_PASSWORD, DOMAIN
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Multi-host (Docker Swarm — 2-3 serwery)

#### Inicjalizacja klastra

**Na managerze:**
```bash
docker swarm init --advertise-addr <MANAGER-IP>
# Zapisz token dołączenia
```

**Na workerach (2-3 serwery):**
```bash
docker swarm join --token <TOKEN> <MANAGER-IP>:2377
```

#### Etykietowanie nodów

```bash
# Manager (nginx + api + dashboard)
docker node update --label-add tier=manager <manager-id>

# Worker-1 (web + redis)
docker node update --label-add tier=frontend <worker-1-id>

# Worker-2 (postgres + printer)
docker node update --label-add tier=data <worker-2-id>
```

#### Deploy

```bash
cd infra/docker
cp .env.example .env
# Edytuj .env — ustaw wszystkie zmienne

docker stack deploy -c docker-compose.swarm.yml weboworos
```

#### Skalowanie API

```bash
# Zwiększ repliki API do 3
docker service scale weboworos_api=3
```

#### Rolling update

```bash
# Nowa wersja obrazu — Swarm robi rolling update automatycznie
docker service update --image ghcr.io/.../api:v1.2 weboworos_api
```

---

## Zmienne środowiskowe

### API (`apps/api/.env`)

| Zmienna | Dev | Prod | Opis |
|---------|-----|------|------|
| `DATABASE_URL` | `postgresql://...` | `postgresql://...` | Połączenie z PostgreSQL |
| `REDIS_URL` | `redis://redis:6379` | `redis://redis:6379` | Połączenie z Redis |
| `JWT_SECRET` | `dev-secret` | **silne hasło** | Klucz JWT (min. 32 znaki) |
| `CORS_ORIGINS` | `http://web:3000,...` | `https://domena.pl,...` | Dozwolone originy |
| `STRIPE_SECRET_KEY` | — | `sk_live_...` | Klucz Stripe |

### Web (`apps/web/.env`)

| Zmienna | Dev | Prod |
|---------|-----|------|
| `NEXT_PUBLIC_API_URL` | `http://api:4000/v1` | `https://api.domena.pl/v1` |
| `NEXT_PUBLIC_WS_URL` | `ws://api:4001` | `wss://ws.domena.pl` |

### Dashboard (`apps/dashboard/.env`)

| Zmienna | Dev | Prod |
|---------|-----|------|
| `NEXT_PUBLIC_API_URL` | `http://api:4000/v1` | `https://api.domena.pl/v1` |
| `NEXT_PUBLIC_WS_URL` | `ws://api:4001` | `wss://ws.domena.pl` |

---

## Health Checks

| Serwis | Endpoint | Interval |
|--------|----------|----------|
| API | `GET /v1/health` | 15s |
| PostgreSQL | `pg_isready` | 10s |
| Redis | `redis-cli ping` | 10s |

---

## SSL / Let's Encrypt

### Opcja A: Certbot (Nginx)

```bash
docker run -it --rm   -v $(pwd)/infra/nginx/ssl:/etc/letsencrypt   -v $(pwd)/infra/nginx/www:/var/www/certbot   certbot/certbot certonly   --webroot -w /var/www/certbot   -d domena.pl -d www.domena.pl -d admin.domena.pl -d api.domena.pl -d ws.domena.pl
```

### Opcja B: Traefik (automatyczny)

Zakomentuj `nginx` i odkomentuj `traefik` w `docker-compose.swarm.yml`.

---

## Backup bazy danych

```bash
# Automatyczny backup (cron)
docker exec ros-postgres-prod pg_dump -U ros_user restaurant_db > backup_$(date +%F).sql
```

---

## Troubleshooting

### "CORS error" w przeglądarce
- Sprawdź `CORS_ORIGINS` w API — musi zawierać domenę frontendu
- W dev: `http://localhost:3000,http://web:3000`
- W prod: `https://domena.pl,https://admin.domena.pl`

### "Cannot connect to database"
- Sprawdź czy `postgres` jest healthy: `docker-compose ps`
- Sprawdź `DATABASE_URL` — musi używać nazwy serwisu `postgres`, nie `localhost`

### WebSocket nie działa
- Nginx musi mieć `proxy_set_header Upgrade $http_upgrade;`
- Sprawdź czy `ws.domena.pl` wskazuje na serwer

### "Module not found" po buildzie
- W Dockerfile.web/dashboard: `output: 'standalone'` w `next.config.js`
- W Dockerfile.api: `pnpm --filter api db:generate` przed buildem

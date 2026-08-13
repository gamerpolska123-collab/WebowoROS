# Setup — Pierwsze uruchomienie

## Wymagania

- Docker 24+ i Docker Compose
- Node.js 20+ (tylko do development bez Docker)
- pnpm 8+
- Git

## Szybki start (Docker — zalecane)

### 1. Klonowanie

```bash
git clone https://github.com/gamerpolska123-collab/WebowoROS.git
cd WebowoROS
```

### 2. Konfiguracja środowiska

```bash
cp .env.example .env
# Edytuj .env — ustaw JWT_SECRET, hasła, domenę
```

### 3. Uruchomienie (dev)

```bash
cd infra/docker
docker-compose up -d
```

### 4. Inicjalizacja bazy

```bash
docker exec -it ros-api npx prisma migrate dev --name init
docker exec -it ros-api npx prisma db seed
```

### 5. Dostęp

| Serwis | URL |
|--------|-----|
| Strona klienta | http://localhost:3000 |
| Panel admina | http://localhost:3001 |
| API | http://localhost:4000/v1 |
| WebSocket | ws://localhost:4001 |

---

## Deployment produkcyjny (single host)

```bash
cd infra/docker
docker-compose -f docker-compose.prod.yml up -d
```

---

## Deployment produkcyjny (multi-host, Docker Swarm)

### Inicjalizacja klastra

**Manager (serwer główny):**
```bash
docker swarm init --advertise-addr <IP_MANAGERA>
```

**Worker 1 (frontend — web + redis):**
```bash
docker swarm join --token <TOKEN> <IP_MANAGERA>:2377
```

**Worker 2 (data — postgres + printer):**
```bash
docker swarm join --token <TOKEN> <IP_MANAGERA>:2377
```

### Etykietowanie

```bash
docker node ls  # zobacz ID nodów

docker node update --label-add tier=manager <ID_MANAGERA>
docker node update --label-add tier=frontend <ID_WORKER_1>
docker node update --label-add tier=data <ID_WORKER_2>
```

### Deploy stacku

```bash
cd infra/docker
docker stack deploy -c docker-compose.swarm.yml weboworos
```

### Sprawdzenie statusu

```bash
docker service ls
docker service ps weboworos_api
docker service logs weboworos_api --tail 50 -f
```

---

## Development bez Docker (niezalecane)

```bash
pnpm install
pnpm --filter api prisma generate
pnpm --filter api prisma migrate dev
pnpm --filter api prisma db seed
pnpm dev
```

---

## Struktura plików .env

```
WebowoROS/
├── .env                    # Root (Docker Compose)
├── apps/api/.env           # API (JWT, DB, Redis)
├── apps/web/.env           # Web (NEXT_PUBLIC_API_URL)
├── apps/dashboard/.env     # Dashboard (NEXT_PUBLIC_API_URL)
└── apps/printer-service/.env  # Printer (REDIS_URL)
```

**Ważne:** W Dockerze używaj nazw serwisów (`api:4000`, `postgres:5432`, `redis:6379`), NIE `localhost`.

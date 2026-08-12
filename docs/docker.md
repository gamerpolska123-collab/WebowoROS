# Docker & Konteneryzacja

## 1. Filozofia

Cały system działa w kontenerach Docker. Lokalnie używamy `docker-compose.yml`, na produkcji (Raspberry Pi 4) `docker-compose.prod.yml`. Wszystkie obrazy są multi-arch (AMD64 + ARM64) dzięki Docker Buildx.

---

## 2. Struktura kontenerów

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network: ros-net                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    nginx    │  │     web     │  │  dashboard  │         │
│  │   :80/443   │  │   :3000     │  │   :3001     │         │
│  │  (reverse   │  │  (Next.js)  │  │  (Next.js)  │         │
│  │   proxy)    │  │             │  │             │         │
│  └──────┬──────┘  └─────────────┘  └─────────────┘         │
│         │                                                   │
│  ┌──────┴──────────────────────────────────────────────┐   │
│  │                    api (NestJS) :4000                │   │
│  └──────┬──────────────────────────────────────────────┘   │
│         │                                                   │
│  ┌──────┴──────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │  postgres   │  │    redis    │  │ printer-service │    │
│  │   :5432     │  │   :6379     │  │    :5000        │    │
│  └─────────────┘  └─────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Pliki Docker

### `infra/docker/docker-compose.yml` (Development)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ros-postgres
    environment:
      POSTGRES_USER: ros_user
      POSTGRES_PASSWORD: ros_password
      POSTGRES_DB: restaurant_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - ros-net

  redis:
    image: redis:7-alpine
    container_name: ros-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - ros-net

  api:
    build:
      context: ../../
      dockerfile: infra/docker/Dockerfile.api
    container_name: ros-api
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://ros_user:ros_password@postgres:5432/restaurant_db
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    volumes:
      - ../../apps/api:/app
      - /app/node_modules
    ports:
      - "4000:4000"
      - "4001:4001"  # WebSocket
    depends_on:
      - postgres
      - redis
    networks:
      - ros-net
    command: pnpm start:dev

  web:
    build:
      context: ../../
      dockerfile: infra/docker/Dockerfile.web
    container_name: ros-web
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000
      - NEXT_PUBLIC_WS_URL=ws://localhost:4001
    volumes:
      - ../../apps/web:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    depends_on:
      - api
    networks:
      - ros-net
    command: pnpm dev

  dashboard:
    build:
      context: ../../
      dockerfile: infra/docker/Dockerfile.dashboard
    container_name: ros-dashboard
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000
      - NEXT_PUBLIC_WS_URL=ws://localhost:4001
    volumes:
      - ../../apps/dashboard:/app
      - /app/node_modules
    ports:
      - "3001:3001"
    depends_on:
      - api
    networks:
      - ros-net
    command: pnpm dev

  printer-service:
    build:
      context: ../../
      dockerfile: infra/docker/Dockerfile.printer
    container_name: ros-printer
    privileged: true  # Dostęp do USB
    volumes:
      - /dev/usb:/dev/usb
      - ../../apps/printer-service:/app
      - /app/node_modules
    environment:
      - REDIS_URL=redis://redis:6379
      - PRINTER_TYPE=escpos
      - PRINTER_INTERFACE=usb
    depends_on:
      - redis
    networks:
      - ros-net

volumes:
  postgres_data:
  redis_data:

networks:
  ros-net:
    driver: bridge
```

### `infra/docker/docker-compose.prod.yml` (Production / Raspberry Pi)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - ros-net
    # Ograniczenia dla Raspberry Pi
    deploy:
      resources:
        limits:
          memory: 512M

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - ./data/redis:/data
    networks:
      - ros-net
    deploy:
      resources:
        limits:
          memory: 128M

  api:
    image: ghcr.io/gamerpolska123-collab/webowo-rosapi:latest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - PAYU_CLIENT_ID=${PAYU_CLIENT_ID}
      - PAYU_CLIENT_SECRET=${PAYU_CLIENT_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - ros-net
    deploy:
      resources:
        limits:
          memory: 512M

  web:
    image: ghcr.io/gamerpolska123-collab/webowo-rosweb:latest
    restart: unless-stopped
    environment:
      - NEXT_PUBLIC_API_URL=https://api.domena.pl
      - NEXT_PUBLIC_WS_URL=wss://ws.domena.pl
    networks:
      - ros-net
    deploy:
      resources:
        limits:
          memory: 256M

  dashboard:
    image: ghcr.io/gamerpolska123-collab/webowo-rosdashboard:latest
    restart: unless-stopped
    environment:
      - NEXT_PUBLIC_API_URL=https://api.domena.pl
      - NEXT_PUBLIC_WS_URL=wss://ws.domena.pl
    networks:
      - ros-net
    deploy:
      resources:
        limits:
          memory: 256M

  printer-service:
    image: ghcr.io/gamerpolska123-collab/webowo-rosprinter:latest
    restart: unless-stopped
    privileged: true
    volumes:
      - /dev/usb:/dev/usb
    environment:
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=production
    depends_on:
      - redis
    networks:
      - ros-net

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/www:/var/www/certbot:ro
    depends_on:
      - web
      - dashboard
      - api
    networks:
      - ros-net

  # Opcjonalnie: Watchtower do auto-update'ów
  watchtower:
    image: containrrr/watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=3600
      - WATCHTOWER_INCLUDE_RESTARTING=true

networks:
  ros-net:
    driver: bridge
```

---

## 4. Dockerfile'y

### `Dockerfile.api` (NestJS)

```dockerfile
# Multi-stage build dla optymalizacji
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages
RUN pnpm install --frozen-lockfile
COPY apps/api ./apps/api
RUN pnpm --filter api build

FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000 4001
CMD ["node", "dist/main.js"]
```

### `Dockerfile.web` (Next.js)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
RUN pnpm install --frozen-lockfile
COPY apps/web ./apps/web
RUN pnpm --filter web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

> **Uwaga**: Next.js wymaga `output: 'standalone'` w `next.config.js` dla optymalizacji obrazu.

### `Dockerfile.printer` (Node.js + ESC/POS)

```dockerfile
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 5000
CMD ["node", "src/index.js"]
```

---

## 5. Build multi-arch (AMD64 + ARM64 dla Raspberry Pi)

```bash
# Rejestracja buildx (raz)
docker buildx create --use --name ros-builder

# Build i push wszystkich obrazów
export REGISTRY=ghcr.io/org
export TAG=latest

docker buildx build   --platform linux/amd64,linux/arm64   -f infra/docker/Dockerfile.api   -t $REGISTRY/ros-api:$TAG   --push .

docker buildx build   --platform linux/amd64,linux/arm64   -f infra/docker/Dockerfile.web   -t $REGISTRY/ros-web:$TAG   --push .

docker buildx build   --platform linux/amd64,linux/arm64   -f infra/docker/Dockerfile.dashboard   -t $REGISTRY/ros-dashboard:$TAG   --push .

docker buildx build   --platform linux/amd64,linux/arm64   -f infra/docker/Dockerfile.printer   -t $REGISTRY/ros-printer:$TAG   --push .
```

---

## 6. Zarządzanie sekretami

W produkcji używamy pliku `.env` (nigdy w repo!) oraz Docker Secrets (opcjonalnie):

```bash
# .env (na serwerze, chmod 600)
DB_USER=ros_prod_user
DB_PASSWORD=<strong-password>
JWT_SECRET=<random-256-bit>
STRIPE_SECRET_KEY=sk_live_...
PAYU_CLIENT_ID=...
PAYU_CLIENT_SECRET=...
```

---

## 7. Komendy użytkowe

```bash
# Start dev
docker-compose -f infra/docker/docker-compose.yml up -d

# Start prod
docker-compose -f infra/docker/docker-compose.prod.yml up -d

# Logi
docker-compose logs -f api
docker-compose logs -f printer-service

# Backup bazy
docker exec ros-postgres pg_dump -U ros_user restaurant_db > backup_$(date +%F).sql

# Restore bazy
docker exec -i ros-postgres psql -U ros_user restaurant_db < backup_2024-08-12.sql

# Aktualizacja obrazów (prod)
docker-compose -f infra/docker/docker-compose.prod.yml pull
docker-compose -f infra/docker/docker-compose.prod.yml up -d

# Przestrzeń dyskowa (Raspberry Pi)
docker system prune -a --volumes  # Czyści nieużywane obrazy i wolumeny
```

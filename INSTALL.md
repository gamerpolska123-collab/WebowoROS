# WebowoROS — Instalacja

## Wymagania
- Node.js 20+ (`node -v`)
- npm 10+ (`npm -v`)
- Docker (opcjonalnie, dla bazy danych)

## Szybka instalacja

```bash
# 1. Rozpakuj
unzip WebowoROS_CLEAN_INSTALL.zip -d WebowoROS
cd WebowoROS

# 2. Konfiguracja
cp .env.example .env
# EDYTUJ .env — ustaw JWT_SECRET, DB password

# 3. Zależności
npm install

# 4. Baza danych (Docker)
docker-compose -f infra/docker/docker-compose.yml up -d postgres redis

# 5. Prisma
npm run db:generate
npm run db:migrate
npm run db:seed

# 6. Dev server
npm run dev
```

## URL
- Web: http://localhost:3000
- Dashboard: http://localhost:3001
- API: http://localhost:4000
- API Docs: http://localhost:4000/api/docs

## Skrypty
```bash
npm run dev      # Dev mode
npm run build    # Production build
npm run test     # Testy
npm run db:seed  # Seed data
```

## Docker
```bash
docker-compose -f infra/docker/docker-compose.yml up --build
```

## Dokumentacja
- `docs/` — techniczna dokumentacja
- `AUDYT.md` — raport audytowy
- `NEXT-STEPS.md` — plan rozwoju
- `SECURITY.md` — bezpieczeństwo

# GitHub Workflow & CI/CD

## 1. Struktura repozytorium

```
restaurant-order-system/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # CI: testy + lint + build
│   │   ├── deploy-staging.yml  # Auto-deploy na staging (Raspberry Pi)
│   │   └── deploy-prod.yml     # Manual deploy na produkcję
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── apps/
│   ├── api/
│   ├── web/
│   ├── dashboard/
│   └── printer-service/
├── packages/
│   ├── shared-types/
│   ├── ui/
│   └── config/
├── infra/
│   ├── docker/
│   └── nginx/
├── docs/
└── README.md
```

---

## 2. Branching Strategy (Git Flow Light)

```
main ───────●────────●────────●────────●─────► (produkcja)
            │        │        │        │
release/1.0 ──────┘ │        │        │
            │        │        │        │
develop ───────●────────●────────●────────●─────► (staging)
     │   │   │   │   │   │   │   │
feature/xyz ──┘   └───┘   └───┘   └──►
            │
hotfix/abc ──┘
```

- `main` - stabilna wersja produkcyjna
- `develop` - branch integracyjny (staging)
- `feature/*` - nowe funkcjonalności (z `develop`)
- `release/*` - przygotowanie wydania (z `develop` do `main`)
- `hotfix/*` - krytyczne poprawki (z `main`)

---

## 3. CI Pipeline (ci.yml)

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck

  test-api:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: cd apps/api && pnpm test:e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret

  test-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: cd apps/web && pnpm test

  build-images:
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, test-api, test-web]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build and push API
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./infra/docker/Dockerfile.api
          platforms: linux/amd64,linux/arm64
          push: true
          tags: |
            ghcr.io/gamerpolska123-collab/webowo-ros-api:${{ github.sha }}
            ghcr.io/gamerpolska123-collab/webowo-ros-api:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## 4. CD Pipeline (deploy-prod.yml)

```yaml
name: Deploy Production

on:
  workflow_dispatch:  # Tylko manualny trigger
    inputs:
      version:
        description: 'Wersja do wdrożenia (tag)'
        required: true
        default: 'latest'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Wymaga akceptacji (protection rules)
    steps:
      - name: Deploy to Raspberry Pi
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PI_HOST }}
          username: ${{ secrets.PI_USER }}
          key: ${{ secrets.PI_SSH_KEY }}
          port: ${{ secrets.PI_SSH_PORT }}
          script: |
            cd ~/ros-project

            # Backup przed deployem
            docker exec ros-postgres pg_dump -U ros_prod_user restaurant_prod | gzip > backups/pre-deploy-$(date +%F_%H-%M).sql.gz

            # Aktualizacja obrazów
            export TAG=${{ github.event.inputs.version }}
            docker-compose pull

            # Zero-downtime restart (Nginx pozostaje)
            docker-compose up -d api web dashboard printer-service

            # Migracja bazy
            docker-compose exec -T api npx prisma migrate deploy

            # Czyszczenie starych obrazów
            docker image prune -af

            # Health check
            sleep 10
            curl -f https://twojadomena.pl/api/health || exit 1
            echo "Deployment successful!"
```

---

## 5. Zarządzanie wersjami (Semantic Versioning)

```
MAJOR.MINOR.PATCH

1.0.0 - Pierwsza wersja produkcyjna
1.1.0 - Nowa funkcjonalność (np. system lojalnościowy)
1.1.1 - Poprawka błędu
2.0.0 - Breaking change (np. zmiana API)
```

### Tworzenie release'u

```bash
git tag -a v1.0.0 -m "Pierwsza wersja produkcyjna"
git push origin v1.0.0
```

---

## 6. Code Review Checklist

Każdy PR musi przejść review przez min. 1 osobę:

- [ ] Kod jest czytelny i dobrze skomentowany
- [ ] Testy jednostkowe dodane/zaktualizowane
- [ ] Nie ma console.log w kodzie produkcyjnym
- [ ] Zmiany w API są udokumentowane
- [ ] Nie ma wycieków sekretów (sprawdź `.env.example`)
- [ ] Lighthouse score nie spadł (dla zmian UI)
- [ ] Zmiany w bazie mają migrację Prisma

---

## 7. Sekrety (GitHub Secrets)

| Sekret | Opis |
|--------|------|
| `GITHUB_TOKEN` | Automatyczny token (do push obrazów) |
| `PI_HOST` | IP/domena Raspberry Pi |
| `PI_USER` | Użytkownik SSH na Pi |
| `PI_SSH_KEY` | Klucz prywatny SSH |
| `PI_SSH_PORT` | Port SSH (np. 2222) |
| `STRIPE_SECRET_KEY` | Klucz Stripe (prod) |
| `PAYU_CLIENT_SECRET` | Klucz PayU (prod) |

---

## 8. Dokumentacja zmian (Changelog)

Plik `CHANGELOG.md` w root repozytorium:

```markdown
# Changelog

## [1.1.0] - 2024-09-15
### Added
- System lojalnościowy (punkty za zamówienia)
- Eksport raportów do Excel

### Fixed
- Poprawka responsywności na iPhone SE
- Optymalizacja czasu ładowania KDS

### Security
- Aktualizacja zależności (axios, lodash)
```

---

*GitHub Workflow v1.1 — 2026-08-13*
*Zmiany: aktualizacja przykładu w changelogu (usunięto wzmiankę o paragonach fiskalnych).*

# PROMPT: ETAP 7 — Optymalizacja i Deployment na Raspberry Pi

Wykonaj ETAP 7 projektu Restaurant Order System.

## Cel
Wdrożenie na Raspberry Pi 4 z monitoringiem i auto-backupami.

## Zadania:

### Zadanie 1: Multi-Arch Docker Images
- `docker buildx` — budowa obrazów dla linux/amd64 + linux/arm64
- Optymalizacja: Alpine Linux, multi-stage builds, usunięcie dev dependencies
- `infra/docker/docker-compose.prod.yml` — produkcyjny compose

### Zadanie 2: Nginx Produkcja
- `infra/nginx/nginx.conf` — gzip, brotli, cache statyczny, rate limiting
- `infra/nginx/ssl/` — certyfikaty Let's Encrypt
- Reverse proxy do wszystkich usług

### Zadanie 3: Monitoring
- Uptime Kuma (docker) — monitoring dostępności strony
- Prometheus + Grafana (opcjonalnie) — metryki API
- Log rotation (docker logs max-size, max-file)

### Zadanie 4: Auto-Update
- Watchtower (docker) — auto-pull nowych obrazów z GitHub Container Registry
- `infra/scripts/deploy.sh` — skrypt deploymentu
- Zero-downtime restart (Nginx pozostaje, reszta restartowana)

### Zadanie 5: Raspberry Pi Optymalizacja
- `infra/scripts/rpi-setup.sh` — setup RPi (Docker, zswap, GPU memory 16MB)
- `infra/scripts/rpi-optimize.sh` — wyłączenie niepotrzebnych usług
- Fail2ban config
- UPS monitoring (opcjonalnie)

### Zadanie 6: Dokumentacja Deploymentu
- `docs/DEPLOY.md` — krok po krok: od czystego RPi do działającej strony
- `docs/TROUBLESHOOTING.md` — najczęstsze problemy i rozwiązania
- `docs/BACKUP-RESTORE.md` — jak robić i przywracać backupy

## Po zakończeniu:
ZAPISZ STAN PRACY w README-AI.md:
- "Etap 7 — Kod: Zakończony"
- Czas ładowania strony na RPi (cel: < 2s)
- Uptime po 7 dniach testów (cel: > 99.5%)

Nie przechodź do Etapu 8 bez mojej zgody.
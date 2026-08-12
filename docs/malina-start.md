# 🍓 Malina Start — Komendy Rozpoczynające Przygodę

> **Ten plik zawiera KROK PO KROKU komendy do uruchomienia całego projektu na Raspberry Pi 4.**  
> Wklejaj komendy jedna po drugiej. Nie pomijaj żadnego kroku.

---

## 0. WYMAGANIA SPRZĘTOWE

| Komponent | Minimalne | Rekomendowane |
|-----------|-----------|---------------|
| Raspberry Pi | 4 Model B | 4 Model B 8GB |
| RAM | 4GB | 8GB |
| Dysk | SSD USB 3.0 128GB | SSD USB 3.0 256GB |
| Zasilacz | 5V/3A USB-C | Oficjalny 5.1V/3A |
| Sieć | Ethernet 100Mbps | Ethernet 1Gbps |
| Obudowa | Z wentylatorem | Z aktywnym chłodzeniem |

> ⚠️ **NIE używaj microSD w produkcji!** SSD jest 10x szybszy i nie zawodzi.

---

## 1. PRZYGOTOWANIE SYSTEMU (Na komputerze, przed włożeniem SSD do Pi)

### 1.1 Pobierz obraz Raspberry Pi OS

```bash
# Na komputerze z Linux/Mac
wget https://downloads.raspberrypi.org/raspios_lite_arm64/images/raspios_lite_arm64-2024-07-04/2024-07-04-raspios-bookworm-arm64-lite.img.xz

# Rozpakuj
unxz 2024-07-04-raspios-bookworm-arm64-lite.img.xz
```

### 1.2 Wypal obraz na SSD

```bash
# Znajdź nazwę dysku (np. /dev/sdX — UWAŻAJ żeby to był SSD!)
lsblk

# Wypal obraz (ZAMIEŃ sdX na właściwą literę!)
sudo dd if=2024-07-04-raspios-bookworm-arm64-lite.img of=/dev/sdX bs=4M status=progress conv=fsync
```

### 1.3 Wstępna konfiguracja (headless — bez monitora)

```bash
# Zamontuj partycję boot z SSD
sudo mkdir -p /mnt/pi-boot
sudo mount /dev/sdX1 /mnt/pi-boot

# Włącz SSH
touch /mnt/pi-boot/ssh

# Skonfiguruj WiFi (opcjonalnie, jeśli nie używasz Ethernet)
cat > /mnt/pi-boot/wpa_supplicant.conf <<'EOF'
country=PL
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="TWOJA_SIEC_WIFI"
    psk="TWOJE_HASLO_WIFI"
    key_mgmt=WPA-PSK
}
EOF

# Ustaw użytkownika (zamień hasło!)
echo 'pi:$(openssl passwd -6 "TwojeSilneHaslo123!")' | sudo tee /mnt/pi-boot/userconf.txt

# Odmontuj
sudo umount /mnt/pi-boot
```

> 💡 **Włóż SSD do Raspberry Pi, podłącz Ethernet i zasilanie.**

---

## 2. PIERWSZE URUCHOMIENIE (Po SSH)

### 2.1 Połącz się przez SSH

```bash
# Znajdź IP Raspberry Pi w routerze lub:
ssh pi@raspberrypi.local
# Hasło: to co ustawiłeś w kroku 1.3
```

### 2.2 Aktualizacja systemu

```bash
sudo apt update && sudo apt full-upgrade -y
```

### 2.3 Podstawowa konfiguracja

```bash
# Ustawienia systemowe
sudo raspi-config
# → Advanced Options → Boot Order → USB (jeśli boot z SSD)
# → Performance Options → GPU Memory → 16 (headless)
# → Localization → Locale → pl_PL.UTF-8
# → Localization → Timezone → Europe/Warsaw
```

### 2.4 Statyczny IP (rekomendowane)

```bash
sudo tee /etc/dhcpcd.conf <<'EOF'
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
EOF

sudo reboot
```

---

## 3. INSTALACJA DOCKER I DOCKER COMPOSE

```bash
# Instalacja Docker
 curl -fsSL https://get.docker.com -o get-docker.sh
 sudo sh get-docker.sh
 sudo usermod -aG docker pi

# Instalacja Docker Compose (plugin)
sudo apt install -y docker-compose-plugin

# Weryfikacja
docker --version
docker compose version

# Wyloguj i zaloguj ponownie (lub)
newgrp docker
```

---

## 4. INSTALACJA PROJEKTU NA MALINIE

### 4.1 Sklonuj repo

```bash
cd ~
git clone https://github.com/gamerpolska123-collab/WebowoROS.git
mv WebowoROS ros-project
cd ros-project
```

### 4.2 Przygotuj katalogi

```bash
mkdir -p data/postgres data/redis backups
mkdir -p nginx/ssl nginx/www
```

### 4.3 Skonfiguruj środowisko

```bash
# Skopiuj plik produkcyjny
cp infra/docker/docker-compose.prod.yml docker-compose.yml

# Stwórz .env (ZAMIEŃ wartości!)
cat > .env <<'EOF'
# Baza danych
DB_USER=ros_prod_user
DB_PASSWORD=$(openssl rand -base64 24)
DB_NAME=restaurant_prod

# JWT
JWT_SECRET=$(openssl rand -base64 32)

# Stripe (testowe na start, produkcyjne po wdrożeniu)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayU (opcjonalnie)
PAYU_CLIENT_ID=...
PAYU_CLIENT_SECRET=...

# Domena (zmień na swoją!)
DOMAIN=twojadomena.pl
EOF

chmod 600 .env
```

### 4.4 SSL (Let's Encrypt) — jeśli masz domenę

```bash
# Certbot w Docker
sudo docker run -it --rm   -v $(pwd)/nginx/www:/var/www/certbot   -v $(pwd)/nginx/ssl:/etc/letsencrypt   certbot/certbot certonly   --webroot -w /var/www/certbot   -d twojadomena.pl -d www.twojadomena.pl

# Auto-renewal (cron)
echo "0 3 * * * cd $(pwd) && docker run --rm -v $(pwd)/nginx/www:/var/www/certbot -v $(pwd)/nginx/ssl:/etc/letsencrypt certbot/certbot renew --quiet" | sudo crontab -
```

> Jeśli NIE masz domeny — użyj self-signed cert na start:
> ```bash
> sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 >   -keyout nginx/ssl/privkey.pem >   -out nginx/ssl/fullchain.pem >   -subj "/CN=localhost"
> ```

---

## 5. URUCHOMIENIE SYSTEMU

### 5.1 Pobierz obrazy i uruchom

```bash
cd ~/ros-project

# Pobierz najnowsze obrazy (po pierwszym deploy z GitHub Actions)
docker compose pull

# Uruchom w tle
docker compose up -d

# Sprawdź status
docker compose ps

# Logi (czy wszystko działa?)
docker compose logs -f api
```

### 5.2 Pierwsza migracja bazy

```bash
# Poczekaj 10s aż PostgreSQL wystartuje
sleep 10

# Migracja Prisma
docker compose exec api npx prisma migrate deploy

# Seed danych (przykładowe menu)
docker compose exec api npx prisma db seed
```

### 5.3 Weryfikacja

```bash
# Test API
curl http://localhost:4000/health
# → {"status":"ok"}

# Test strony (z maliny)
curl -I http://localhost:3000
# → HTTP/1.1 200 OK

# Test dashboardu
curl -I http://localhost:3001
# → HTTP/1.1 200 OK
```

---

## 6. KONFIGURACJA ROUTERA (Port Forwarding)

W panelu routera przekieruj porty na IP maliny (np. 192.168.1.100):

| Port zewnętrzny | Port wewnętrzny | Cel |
|-------------------|-----------------|-----|
| 80 | 80 | HTTP → HTTPS redirect |
| 443 | 443 | HTTPS (strona klienta) |
| 2222 | 22 | SSH (zmień domyślny port!) |

> ⚠️ **NIGDY nie wystawiaj portu 22 na świat bez zmiany portu!**

---

## 7. BEZPIECZEŃSTWO (Konieczne!)

### 7.1 Zmiana portu SSH

```bash
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### 7.2 Klucze SSH (wyłącz logowanie hasłem)

```bash
# Na swoim komputerze wygeneruj klucz
ssh-keygen -t ed25519 -C "twoj@email.com"
ssh-copy-id -p 2222 pi@twojadomena.pl

# Na malinie wyłącz logowanie hasłem
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### 7.3 Fail2ban

```bash
sudo apt install -y fail2ban

sudo tee /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime = 3600
maxretry = 3

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
EOF

sudo systemctl restart fail2ban
```

### 7.4 Firewall (UFW)

```bash
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp   # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
```

---

## 8. CODZIENNE KOMENDY (Po uruchomieniu)

### Sprawdzenie statusu
```bash
cd ~/ros-project
docker compose ps
docker compose logs -f api
docker compose logs -f web
docker stats
```

### Aktualizacja (po nowym deploy z GitHub)
```bash
cd ~/ros-project
docker compose pull
docker compose up -d

# Migracja (jeśli schema się zmieniło)
docker compose exec api npx prisma migrate deploy

# Czyszczenie starych obrazów
docker image prune -af
```

### Backup bazy
```bash
# Ręczny backup
docker compose exec postgres pg_dump -U ros_prod_user restaurant_prod | gzip > backups/manual-$(date +%F_%H-%M).sql.gz

# Automatyczny (cron — już skonfigurowany w docker-compose)
```

### Przywracanie backupu
```bash
gunzip < backups/manual-2024-08-12_03-00.sql.gz | docker compose exec -T postgres psql -U ros_prod_user restaurant_prod
```

### Restart usługi
```bash
docker compose restart api
docker compose restart web
```

---

## 9. MONITORING

### Sprawdzenie temperatury
```bash
vcgencmd measure_temp
# → temp=45.6'C (OK jeśli < 80°C)
```

### Obciążenie
```bash
htop
# lub
docker stats
```

### Miejsce na dysku
```bash
df -h
docker system df
```

### Logi systemowe
```bash
journalctl -u docker -f
```

---

## 10. TROUBLESHOOTING

### Problem: Strona nie działa
```bash
# Sprawdź czy kontenery działają
docker compose ps

# Sprawdź logi Nginx
docker compose logs nginx

# Sprawdź czy web odpowiada
docker compose exec web wget -qO- http://localhost:3000
```

### Problem: Błąd połączenia z bazą
```bash
docker compose exec postgres pg_isready -U ros_prod_user
# → /var/run/postgresql:5432 - accepting connections

docker compose logs postgres
```

### Problem: Drukarka nie drukuje
```bash
# Sprawdź czy drukarka jest widoczna
ls -la /dev/usb/lp*

# Sprawdź logi printer-service
docker compose logs printer-service
```

### Problem: Wysokie zużycie RAM
```bash
# Sprawdź
docker stats

# Zmniejsz limity w docker-compose.yml (sekcja deploy/resources/limits)
# Lub dodaj zswap:
echo 'zswap.enabled=1' | sudo tee -a /boot/firmware/cmdline.txt
sudo reboot
```

### Problem: Brak miejsca na dysku
```bash
# Czyść Docker
docker system prune -a --volumes

# Czyść logi
sudo journalctl --vacuum-time=7d
```

---

## 11. PRZYDATNE ALIASY (Dodaj do ~/.bashrc)

```bash
cat >> ~/.bashrc <<'EOF'

# ROS aliases
alias ros='cd ~/ros-project'
alias ros-up='cd ~/ros-project && docker compose up -d'
alias ros-down='cd ~/ros-project && docker compose down'
alias ros-logs='cd ~/ros-project && docker compose logs -f'
alias ros-ps='cd ~/ros-project && docker compose ps'
alias ros-backup='cd ~/ros-project && docker compose exec postgres pg_dump -U ros_prod_user restaurant_prod | gzip > backups/manual-$(date +%F_%H-%M).sql.gz'
alias ros-update='cd ~/ros-project && docker compose pull && docker compose up -d && docker image prune -af'
alias ros-temp='vcgencmd measure_temp'
EOF

source ~/.bashrc
```

---

## 12. PIERWSZY TEST (Po uruchomieniu)

Otwórz przeglądarkę i wejdź na:
- **Strona klienta**: `https://twojadomena.pl` (lub `http://192.168.1.100` bez SSL)
- **Dashboard**: `https://twojadomena.pl/dashboard` (lub `http://192.168.1.100:3001`)
- **API**: `https://twojadomena.pl/api/health`

Zaloguj się do dashboardu:
- Email: `admin@example.com`
- Hasło: `Admin123!`

> ⚠️ **ZMIEŃ hasło admina natychmiast po pierwszym logowaniu!**

---

## 13. CO DALEJ?

1. **Skonfiguruj menu** w dashboardzie (dodaj produkty, ceny, zdjęcia)
2. **Ustaw upsell** (cross-sell, bundles, promocje)
3. **Skonfiguruj drukarki** (USB / Ethernet)
4. **Przełącz Stripe na produkcyjny** (sk_test → sk_live)
5. **Włącz powiadomienia SMS** (opcjonalnie)

Szczegóły w `docs/setup.md` i `docs/hardware.md`.

---

*Malina Start v1.0 — 2026-08-12*  
*Repo: https://github.com/gamerpolska123-collab/WebowoROS*

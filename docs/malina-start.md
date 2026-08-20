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
wget https://downloads.raspberrypi.org/raspios_lite_arm64/images/raspios_lite_arm64-2024-07-04/2024-07-04-raspios-bookworm-arm64-lite.img.xz
unxz 2024-07-04-raspios-bookworm-arm64-lite.img.xz
```

### 1.2 Wypal obraz na SSD

```bash
lsblk
sudo dd if=2024-07-04-raspios-bookworm-arm64-lite.img of=/dev/sdX bs=4M status=progress conv=fsync
```

### 1.3 Wstępna konfiguracja (headless)

```bash
sudo mkdir -p /mnt/pi-boot
sudo mount /dev/sdX1 /mnt/pi-boot
touch /mnt/pi-boot/ssh

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

echo 'pi:$(openssl passwd -6 "TwojeSilneHaslo123!")' | sudo tee /mnt/pi-boot/userconf.txt
sudo umount /mnt/pi-boot
```

> 💡 **Włóż SSD do Raspberry Pi, podłącz Ethernet i zasilanie.**

---

## 2. PIERWSZE URUCHOMIENIE (Po SSH)

### 2.1 Połącz się przez SSH

```bash
ssh pi@raspberrypi.local
```

### 2.2 Aktualizacja systemu

```bash
sudo apt update && sudo apt full-upgrade -y
```

### 2.3 Podstawowa konfiguracja

```bash
sudo raspi-config
# → Advanced Options → Boot Order → USB
# → Performance Options → GPU Memory → 16
# → Localization → Locale → pl_PL.UTF-8
# → Localization → Timezone → Europe/Warsaw
```

### 2.4 Statyczny IP

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
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker pi
sudo apt install -y docker-compose-plugin
docker --version
docker compose version
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
cp infra/docker/docker-compose.prod.yml docker-compose.yml

cat > .env <<'EOF'
DB_USER=ros_prod_user
DB_PASSWORD=$(openssl rand -base64 24)
DB_NAME=restaurant_prod
JWT_SECRET=$(openssl rand -base64 32)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYU_CLIENT_ID=...
PAYU_CLIENT_SECRET=...
DOMAIN=twojadomena.pl
EOF

chmod 600 .env
```

### 4.4 SSL (Let's Encrypt)

```bash
sudo docker run -it --rm -v $(pwd)/nginx/www:/var/www/certbot -v $(pwd)/nginx/ssl:/etc/letsencrypt certbot/certbot certonly --webroot -w /var/www/certbot -d twojadomena.pl -d www.twojadomena.pl

echo "0 3 * * * cd $(pwd) && docker run --rm -v $(pwd)/nginx/www:/var/www/certbot -v $(pwd)/nginx/ssl:/etc/letsencrypt certbot/certbot renew --quiet" | sudo crontab -
```

> Jeśli NIE masz domeny:
> ```bash
> sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx/ssl/privkey.pem -out nginx/ssl/fullchain.pem -subj "/CN=localhost"
> ```

---

## 5. URUCHOMIENIE SYSTEMU

### 5.1 Pobierz obrazy i uruchom

```bash
cd ~/ros-project
docker compose pull
docker compose up -d
docker compose ps
```

### 5.2 Pierwsza migracja bazy

```bash
sleep 10
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

### 5.3 Weryfikacja

```bash
curl http://localhost:4000/health
curl -I http://localhost:3000
curl -I http://localhost:3001
```

---

## 6. KONFIGURACJA ROUTERA (Port Forwarding)

| Port zewnętrzny | Port wewnętrzny | Cel |
|-------------------|-----------------|-----|
| 80 | 80 | HTTP → HTTPS redirect |
| 443 | 443 | HTTPS |
| 2222 | 22 | SSH |

> ⚠️ **NIGDY nie wystawiaj portu 22 na świat bez zmiany portu!**

---

## 7. BEZPIECZEŃSTWO

### 7.1 Zmiana portu SSH

```bash
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### 7.2 Klucze SSH

```bash
ssh-keygen -t ed25519 -C "twoj@email.com"
ssh-copy-id -p 2222 pi@twojadomena.pl
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
sudo ufw allow 2222/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 8. CODZIENNE KOMENDY

### Sprawdzenie statusu
```bash
cd ~/ros-project
docker compose ps
docker compose logs -f api
docker stats
```

### Aktualizacja
```bash
cd ~/ros-project
docker compose pull
docker compose up -d
docker compose exec api npx prisma migrate deploy
docker image prune -af
```

### Backup bazy
```bash
docker compose exec postgres pg_dump -U ros_prod_user restaurant_prod | gzip > backups/manual-$(date +%F_%H-%M).sql.gz
```

### Przywracanie backupu
```bash
gunzip < backups/manual-2024-08-12_03-00.sql.gz | docker compose exec -T postgres psql -U ros_prod_user restaurant_prod
```

---

## 9. MONITORING

```bash
vcgencmd measure_temp
htop
docker stats
df -h
docker system df
journalctl -u docker -f
```

---

## 10. TROUBLESHOOTING

### Strona nie działa
```bash
docker compose ps
docker compose logs nginx
docker compose exec web wget -qO- http://localhost:3000
```

### Błąd połączenia z bazą
```bash
docker compose exec postgres pg_isready -U ros_prod_user
docker compose logs postgres
```

### Drukarka nie drukuje
```bash
ls -la /dev/usb/lp*
docker compose logs printer-service
```

### Wysokie zużycie RAM
```bash
docker stats
echo 'zswap.enabled=1' | sudo tee -a /boot/firmware/cmdline.txt
sudo reboot
```

### Brak miejsca na dysku
```bash
docker system prune -a --volumes
sudo journalctl --vacuum-time=7d
```

---

## 11. PRZYDATNE ALIASY

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

## 12. PIERWSZY TEST

Otwórz przeglądarkę:
- **Strona klienta**: `https://twojadomena.pl`
- **Dashboard**: `https://twojadomena.pl/dashboard`
- **API**: `https://twojadomena.pl/api/health`

Zaloguj się do dashboardu:
- Email: `admin@example.com`
- Hasło: `Admin123!`

> ⚠️ **ZMIEŃ hasło admina natychmiast po pierwszym logowaniu!**

---

## 13. CO DALEJ?

1. **Skonfiguruj menu** w dashboardzie
2. **Ustaw upsell** (cross-sell, bundles, promocje)
3. **Skonfiguruj drukarki** (USB / Ethernet)
4. **Przełącz Stripe na produkcyjny**
5. **Włącz powiadomienia SMS** (opcjonalnie)

Szczegóły w `docs/setup.md` i `docs/hardware.md`.

---

*Malina Start v1.0 — 2026-08-12*

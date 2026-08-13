# Hardware & Raspberry Pi 4

> **Ważne**: Restaurant Order System (ROS) **nie zastępuje kasy fiskalnej** restauracji.  
> ROS drukuje wyłącznie **bilety wewnętrzne** (kuchenne i dla kierowców). Paragon fiskalny obsługuje osobna, certyfikowana kasa fiskalna poza systemem ROS.

---

## 1. Specyfikacja sprzętowa

### Raspberry Pi 4 (rekomendowana konfiguracja)
| Komponent | Specyfikacja |
|-----------|--------------|
| Model | Raspberry Pi 4 Model B |
| RAM | 4GB (minimum) / 8GB (rekomendowane) |
| Storage | SSD USB 3.0 128GB+ (NIE microSD dla produkcji!) |
| Zasilacz | Oficjalny 5V/3A USB-C |
| Obudowa | Aktywne chłodzenie (przegrzanie = throttle) |
| Sieć | Ethernet (preferowane) lub WiFi 5GHz |

### Dlaczego SSD zamiast microSD?
- microSD ma ograniczoną liczbę cykli zapisu (wear leveling)
- SSD USB 3.0 jest 10x szybszy w IOPS
- Mniejsze ryzyko utraty danych przy awarii zasilania

---

## 2. Instalacja systemu na Raspberry Pi

### Krok 1: Przygotowanie SSD
```bash
# Na komputerze z Linux/Mac
# Pobierz Raspberry Pi Imager lub użyj dd

# Pobierz Raspberry Pi OS Lite (64-bit, Debian Bookworm)
# https://downloads.raspberrypi.org/raspios_lite_arm64/images/

# Wypal obraz na SSD
sudo dd if=2024-07-04-raspios-bookworm-arm64-lite.img of=/dev/sdX bs=4M status=progress
```

### Krok 2: Wstępna konfiguracja (headless)

Przed pierwszym uruchomieniem zamontuj partycję `bootfs` i utwórz pliki:

```bash
# Włączenie SSH
touch /mnt/bootfs/ssh

# Konfiguracja WiFi (opcjonalnie, jeśli nie używasz Ethernet)
cat > /mnt/bootfs/wpa_supplicant.conf <<'EOF'
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
echo 'pi:$(openssl passwd -6 "TwojeSilneHaslo123!")' | sudo tee /mnt/bootfs/userconf.txt

# Odmontuj
sudo umount /mnt/bootfs
```

> 💡 **Włóż SSD do Raspberry Pi, podłącz Ethernet i zasilanie.**  
> W BIOS (jeśli boot z SSD nie działa): `sudo raspi-config` → Boot Order → USB

---

## 3. Konfiguracja sieci

### Statyczny IP (rekomendowane dla serwera)

```bash
# /etc/dhcpcd.conf
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
```

### Port forwarding (jeśli za routerem)
- Port 80 → 192.168.1.100:80
- Port 443 → 192.168.1.100:443
- Port 22 → 192.168.1.100:22 (SSH, zmień na niestandardowy!)

---

## 4. Drukarki termiczne w ROS

> **ROS drukuje wyłącznie bilety wewnętrzne. Paragon fiskalny wystawia osobna kasa fiskalna restauracji.**

### 4.1 Obsługiwane modele
| Model | Interfejs | Biblioteka | Uwagi |
|-------|-----------|------------|-------|
| Epson TM-T20II | USB | node-escpos | Niezawodna, popularna |
| Epson TM-T88V | USB/Ethernet | node-escpos | Szybsza, droższa |
| Xprinter XP-58 | USB | node-escpos | Tania alternatywa |
| Rongta RP58 | USB | node-escpos | Dobra jakość/cena |

### 4.2 Podłączenie USB do kontenera Docker

```yaml
# W docker-compose.prod.yml
printer-service:
  image: ghcr.io/gamerpolska123-collab/webowo-rosprinter:latest
  privileged: true
  volumes:
    - /dev/usb/lp0:/dev/usb/lp0
  devices:
    - /dev/usb/lp0:/dev/usb/lp0
```

### 4.3 Szablony wydruków w ROS

System drukuje **dwa rodzaje biletów** (nie drukuje paragonów fiskalnych):

#### A. Bilet kuchenny (Kitchen Ticket)
Dla kuchni — duża czcionka, bez cen, z uwagami i alergenami.

```
================================
 ZAMOWIENIE #ZAM-001
 12:34 12.08.2024
================================

PIZZA MARGHERITA (x2)
  [SREDNIA 40cm]
  + Extra ser
  + Pieczarki
  UWAGA: Bez cebuli

PIZZA CAPRICIOSA (x1)
  [DUZA 50cm]

--------------------------------
SZACOWANY CZAS: 45 min
================================
```

#### B. Bilet kierowcy (Driver Ticket) — zawiera DANE DO KASY
Dla kierowcy **i dla kasjerów** — zawiera pełne rozbicie pozycji z cenami, aby kasjer mógł przepisać 1:1 na kasę fiskalną.

```
================================
 BILET KIEROWCY / DLA KASY
 ZAM-20240813-001
 14:32 | Dostawa
================================

PIZZA MARGHERITA (x1)
  [SREDNIA 40cm]     39,00 zl
  + Extra ser          5,00 zl
  + Pieczarki          3,00 zl
  Razem pozycja:      47,00 zl

PIZZA CAPRICIOSA (x1)
  [DUZA 50cm]        49,00 zl
  Razem pozycja:      49,00 zl

--------------------------------
Suma produkty:        96,00 zl
Dostawa:               8,00 zl
Napiwek:               5,00 zl
--------------------------------
RAZEM DO ZAPLATY:    109,00 zl
================================
Dane do kasy fiskalnej:
  Jan Kowalski
  ul. Przykladowa 14/5
  66-400 Gorzow Wlkp.
  Tel: 123 456 789
  Uwagi: Prosze o cichy dzwonek
================================
```

**Zasada**: Kierowca dostaje bilet. Przy kasie bilet służy jako źródło danych do przepisania na kasę fiskalną. Numer zamówienia (`ZAM-XXX`) jest taki sam na bilecie kierowcy i w systemie — łatwo powiązać.

---

## 5. Optymalizacja wydajności Raspberry Pi 4

### Zmniejszenie zużycia RAM

```bash
# Wyłączenie niepotrzebnych usług
sudo systemctl disable bluetooth
sudo systemctl disable avahi-daemon

# Zmniejszenie ilości RAM dla GPU (headless)
sudo raspi-config
# Performance Options -> GPU Memory -> 16

# Włączenie zswap (kompresja RAM)
echo 'zswap.enabled=1 zswap.zpool=zsmalloc' | sudo tee -a /boot/firmware/cmdline.txt
```

### Monitoring temperatury i obciążenia

```bash
# Sprawdzenie temperatury
vcgencmd measure_temp

# Sprawdzenie obciążenia
htop

# Logi Dockera
journalctl -u docker -f
```

---

## 6. Backup i disaster recovery

### Automatyczny backup (cron)

```bash
# /etc/cron.daily/ros-backup
#!/bin/bash
DATE=$(date +%F_%H-%M)
BACKUP_DIR=/home/pi/backups
DB_CONTAINER=ros-postgres

# Backup bazy
docker exec $DB_CONTAINER pg_dump -U ros_user restaurant_db | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup plików (env, nginx conf)
tar czf $BACKUP_DIR/config_$DATE.tar.gz /home/pi/ros-project/.env /home/pi/ros-project/nginx/

# Usuwanie starych backupów (zostaw 7 dni)
find $BACKUP_DIR -type f -mtime +7 -delete

# Sync do chmury (opcjonalnie)
rclone sync $BACKUP_DIR remote:ros-backups
```

### Disaster Recovery

```bash
# Przywracanie bazy
gunzip < backup_2024-08-12_03-00.sql.gz | docker exec -i ros-postgres psql -U ros_user restaurant_db

# Przywracanie kontenerów
cd /home/pi/ros-project
docker-compose -f infra/docker/docker-compose.prod.yml down
docker-compose -f infra/docker/docker-compose.prod.yml up -d
```

---

## 7. Bezpieczeństwo fizyczne

- **UPS**: Zasilacz awaryjny (przynajmniej 600VA) - ochrona przed nagłym wyłączeniem
- **Obudowa z zamkiem**: Fizyczna ochrona przed nieautoryzowanym dostępem
- **SSH**: Zmiana portu, wyłączenie logowania hasłem (tylko klucze SSH)
- **Fail2ban**: Blokowanie prób brute-force

```bash
# Instalacja fail2ban
sudo apt install -y fail2ban

# Konfiguracja SSH
sudo tee /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
maxretry = 3

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
EOF

sudo systemctl restart fail2ban
```

---

*Hardware v1.1 — 2026-08-13*  
*Zmiany: doprecyzowanie roli drukarek (bilety wewnętrzne, nie paragony fiskalne), nowy szablon biletów kierowcy z danymi do kasy.*

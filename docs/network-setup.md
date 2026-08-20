# 🌐 Konfiguracja sieci lokalnej — WebowoROS

> **Scenariusz:** Raspberry Pi leży w kącie bez monitora. Obsługa wyłącznie przez SSH z laptopa/telefonu w tej samej sieci WiFi/Ethernet.

---

## Szybki start (3 kroki)

### Krok 1: Znajdź IP Raspberry Pi

Na Raspberry Pi (przez SSH):
```bash
./start.sh network
```

Lub ręcznie:
```bash
ip addr show | grep "inet " | grep -v "127.0.0.1"
```

Wynik:
```
  192.168.1.50
```

### Krok 2: Ustaw IP w `.env`

```bash
nano .env
```

Zmień:
```env
NETWORK_HOST=192.168.1.50
```

### Krok 3: Zrestartuj serwisy

```bash
./start.sh restart
```

---

## Dostęp z urządzeń w sieci lokalnej

Po konfiguracji wszystkie usługi są dostępne pod adresem IP Raspberry Pi:

| Usługa | Adres (przykład) |
|--------|------------------|
| **Web (klient)** | `http://192.168.1.50:3000` |
| **Dashboard (admin)** | `http://192.168.1.50:3001` |
| **API** | `http://192.168.1.50:4000/v1` |
| **Swagger Docs** | `http://192.168.1.50:4000/api-docs` |
| **WebSocket** | `ws://192.168.1.50:4001` |
| **PostgreSQL** | `192.168.1.50:5432` |
| **Redis** | `192.168.1.50:6379` |

---

## Dostęp z telefonu / tabletu

1. Podłącz telefon do tej samej sieci WiFi co Raspberry Pi
2. Otwórz przeglądarkę
3. Wpisz: `http://192.168.1.50:3000` (zamień IP na swoje)
4. Zamawiaj pizzę z telefonu! 📱🍕

---

## Dostęp z zewnątrz (opcjonalnie)

Jeśli chcesz dostęp spoza sieci lokalnej (np. z pracy), potrzebujesz:

### Opcja A: Port forwarding w routerze
1. Zaloguj się do routera (zazwyczaj `http://192.168.1.1`)
2. Znajdź sekcję "Port Forwarding" / "Wirtualne serwery"
3. Przekieruj porty na IP Raspberry Pi:
   - Port 3000 → 192.168.1.50:3000 (web)
   - Port 3001 → 192.168.1.50:3001 (dashboard)
   - Port 4000 → 192.168.1.50:4000 (API)
4. Znajdź publiczne IP routera: `curl ifconfig.me`
5. Dostęp: `http://TWOJE_PUBLICZNE_IP:3000`

### Opcja B: Cloudflare Tunnel (bezpieczniejsze, bez otwierania portów)
```bash
# Zainstaluj cloudflared w kontenerze lub na hoście
docker run --rm cloudflare/cloudflared:latest tunnel --no-autoupdate run --token TWÓJ_TOKEN
```

---

## Statyczne IP (zalecane)

Aby IP Raspberry Pi się nie zmieniało po restarcie routera:

### Metoda 1: DHCP reservation w routerze
Zaloguj się do routera i przypisz stałe IP do MAC adresu Raspberry Pi.

### Metoda 2: Statyczne IP w Raspberry Pi
```bash
sudo nano /etc/dhcpcd.conf
```

Dodaj na końcu:
```
interface eth0
static ip_address=192.168.1.50/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
```

Zrestartuj:
```bash
sudo reboot
```

---

## Troubleshooting

### Nie mogę połączyć się z API z laptopa
```bash
# Na Raspberry Pi — sprawdź czy API nasłuchuje na wszystkich interfejsach
docker exec ros-api ss -tlnp | grep 4000
# Powinno pokazać: 0.0.0.0:4000

# Sprawdź firewall
sudo ufw status
# Jeśli aktywny — otwórz porty:
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 4000/tcp
sudo ufw allow 4001/tcp
```

### CORS errors w przeglądarce
Upewnij się, że `NETWORK_HOST` w `.env` jest ustawione na IP Raspberry Pi, a nie `localhost`.

```bash
# Sprawdź aktualną konfigurację
docker exec ros-api env | grep CORS
```

### WebSocket nie łączy się z telefonu
Sprawdź czy `NEXT_PUBLIC_WS_URL` wskazuje na IP sieciowe:
```bash
docker exec ros-web env | grep WS_URL
docker exec ros-dashboard env | grep WS_URL
```

Powinno być: `ws://192.168.1.50:4001` (nie `ws://localhost:4001`)

---

*Dokumentacja wygenerowana dla WebowoROS v2.1*

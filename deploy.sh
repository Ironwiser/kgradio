#!/bin/bash
# KG Radio – npm kurulumu + nginx ayarı
# Proje kökünden: ./deploy.sh  veya  bash deploy.sh

set -e
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "→ f: eski node_modules siliniyor, npm install + build"
(cd "$ROOT_DIR/f" && rm -rf node_modules dist && npm install && npm run build)

echo "→ b: eski node_modules siliniyor, npm install"
(cd "$ROOT_DIR/b" && rm -rf node_modules && npm install)

echo "→ AzuraCast (Docker) kurulumu / güncellemesi"

# Docker yoksa kur
if ! command -v docker &>/dev/null; then
  echo "  Docker bulunamadı, kuruluyor..."
  sudo apt update
  sudo apt install -y docker.io docker-compose-plugin
  sudo systemctl enable docker --now
fi

AZ_DIR="/var/azuracast"

if [ ! -d "$AZ_DIR" ]; then
  echo "  AzuraCast ilk kurulum yapılıyor..."
  sudo mkdir -p "$AZ_DIR"
  sudo chown "$USER":"$USER" "$AZ_DIR"
  cd "$AZ_DIR"

  # En güncel script yolu için: https://azuracast.com/docs/getting-started/installation/docker
  curl -fsSL https://raw.githubusercontent.com/AzuraCast/AzuraCast/main/docker.sh -o docker.sh
  chmod +x docker.sh

  # Etkileşimsiz kurulum
  yes '' | ./docker.sh install

  # HTTP/HTTPS portlarını 8080/8443'e al (host'ta 80/443'ü Nginx kullanacak)
  if [ -f .env ]; then
    sed -i 's/^AZURACAST_HTTP_PORT=.*/AZURACAST_HTTP_PORT=8080/' .env || true
    sed -i 's/^AZURACAST_HTTPS_PORT=.*/AZURACAST_HTTPS_PORT=8443/' .env || true
    docker compose down || true
    docker compose up -d || true
  fi
else
  echo "  Var olan AzuraCast güncelleniyor..."
  cd "$AZ_DIR"
  ./docker.sh update-self || true
  # Güncelleme sırasında etkileşimli soruları otomatik "yes" ile geç
  yes "" | ./docker.sh update || true
fi

cd "$ROOT_DIR"

echo "→ Nginx konfigürasyonu yazılıyor..."
if [ ! -d "/etc/nginx/sites-available" ]; then
    echo "UYARI: /etc/nginx/sites-available yok. Nginx atlanıyor."
else
    sudo tee /etc/nginx/sites-available/lforadio.conf > /dev/null << EOF
server {
    listen 80;
    listen [::]:80;
    server_name lforadio.omurgenc.dev;

    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name radio.lforadio.omurgenc.dev;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
    }
}
EOF
    if [ -d "/etc/nginx/sites-enabled" ]; then
        sudo ln -sf /etc/nginx/sites-available/lforadio.conf /etc/nginx/sites-enabled/
    fi
    sudo nginx -t && sudo systemctl reload nginx
    echo "Nginx reload edildi."
fi

echo "→ SSL sertifikası (certbot)"
if command -v certbot &>/dev/null; then
    sudo certbot --nginx -d lforadio.omurgenc.dev -d radio.lforadio.omurgenc.dev --non-interactive --agree-tos --register-unsafely-without-email 2>/dev/null || echo "  Sertifika alınamadı; elle: sudo certbot --nginx -d lforadio.omurgenc.dev -d radio.lforadio.omurgenc.dev"
else
    echo "  certbot yok; kur: sudo apt install certbot python3-certbot-nginx"
fi

echo ""
echo "Deploy tamamlandı."
echo "Backend: cd b && PORT=3010 NODE_ENV=production pm2 start server.js --name lforadio --cwd /var/www/lforadio/b"

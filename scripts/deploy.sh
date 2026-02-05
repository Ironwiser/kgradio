#!/usr/bin/env bash
# KG Radio – Tek komutla redeploy (build + restart)
# Sunucuda proje kökünden: bash scripts/deploy.sh

set -e
cd "$(dirname "$0")/.."

echo "→ f: npm ci + build"
cd f && npm ci && npm run build && cd ..

echo "→ b: npm ci"
cd b && npm ci && cd ..

echo "→ Restart"
if command -v pm2 &>/dev/null; then
  (cd b && pm2 restart kg-radio) 2>/dev/null || (cd b && pm2 start server.js --name kg-radio -- NODE_ENV=production PORT=14400)
else
  echo "  pm2 yok; uygulamayı elle yeniden başlatın:"
  echo "  cd b && NODE_ENV=production PORT=14400 node server.js"
fi

echo "✓ Redeploy bitti."

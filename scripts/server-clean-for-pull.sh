#!/bin/bash
# Sunucuda git pull öncesi: "untracked would be overwritten" dosyalarını kaldırır.
# Kullanım: Sunucuda /var/www/lforadio içinde: bash scripts/server-clean-for-pull.sh
# Önce: cp b/.env b/.env.server.backup
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ b/.env yedekleniyor (varsa)..."
[ -f b/.env ] && cp -a b/.env b/.env.server.backup || true

echo "→ Takip edilen değişiklikler sıfırlanıyor (git reset --hard)..."
git reset --hard HEAD

echo "→ Pull'da çakışacak untracked dosyalar kaldırılıyor..."
rm -f b/.env.example
rm -f b/controllers/userController.js b/db.js b/middleware/auth.js b/routes/userRoutes.js
rm -f b/sql/00_create_database.sql b/sql/README.md
rm -f b/sql/Seed/01_plans_seed.sql b/sql/Tables/plans_table.sql b/sql/Tables/users_table.sql
rm -f b/sql/Views/vw_users_with_plan.sql b/sql/run_all.sql
rm -f f/public/animasyon/.gitkeep f/public/animasyon/README.txt
rm -rf f/public/animasyon/*.mp4 2>/dev/null || true
rm -f f/public/fonts/NeueHaasDisplayBlack.ttf f/public/fonts/NeueHaasGrotDisp-25XThin-Trial.otf
rm -f f/public/fonts/NeueMachina-Light.otf f/public/fonts/NeueMachina-Regular.otf f/public/fonts/NeueMachina-Ultrabold.otf
rm -f "f/public/fonts/Personal-license-agreement"
rm -f f/src/context/auth-context.tsx f/src/pages/Giris.tsx f/src/pages/Hakkimizda.tsx f/src/pages/Kayit.tsx f/src/pages/Listeler.tsx
rm -f scripts/nginx/kg-radio.conf scripts/nginx/lforadio.conf
rm -f setup_databases.bat

echo "→ git pull..."
git pull

echo "→ deploy.sh CRLF düzeltiliyor..."
sed -i 's/\r$//' deploy.sh

echo "→ .env geri yükleniyor (yedek varsa)..."
[ -f b/.env.server.backup ] && cp -a b/.env.server.backup b/.env || true

echo "Tamam. Şimdi: ./deploy.sh"

# Sunucuda git pull ve deploy

Sunucuda (`root@srv784745`) aşağıdaki adımları **sırayla** uygula.

## Önce: deploy.sh CRLF düzelt (pull olmasa da çalışsın)

```bash
cd /var/www/lforadio
sed -i 's/\r$//' deploy.sh
```

Bundan sonra `./deploy.sh` çalışır; ama `git pull` hâlâ hata verir.

---

## Seçenek A – Repo ile tam senkron (önerilen)

Sunucudaki tüm değişiklikleri bırakıp repodaki son hali çekmek istiyorsan:

### 1. Server’a özel dosyayı yedekle (DB şifresi)

```bash
cd /var/www/lforadio
cp -a b/.env b/.env.server.backup
```

### 2. Takip edilen dosyaları repoya göre sıfırla

```bash
git reset --hard HEAD
```

### 3. “Untracked would be overwritten” listesini temizle

Pull, bu dosyaları repodan yazmak istiyor; sunucuda untracked oldukları için çakışıyor. Hepsini silersen pull sorunsuz olur (repo’daki hali gelir).

```bash
rm -f b/.env.example
rm -f b/controllers/userController.js b/db.js b/middleware/auth.js b/routes/userRoutes.js
rm -f b/sql/00_create_database.sql b/sql/README.md
rm -f b/sql/Seed/01_plans_seed.sql
rm -f b/sql/Tables/plans_table.sql b/sql/Tables/users_table.sql
rm -f b/sql/Views/vw_users_with_plan.sql b/sql/run_all.sql
rm -f f/public/animasyon/.gitkeep f/public/animasyon/README.txt
rm -f "f/public/animasyon/WhatsApp Video 2026-02-07 at 03.07.32.mp4"
rm -f f/public/animasyon/20260222_*.mp4
rm -f f/public/animasyon/assets_task_*.mp4 f/public/animasyon/task_*.mp4
rm -f f/public/fonts/NeueHaasDisplayBlack.ttf f/public/fonts/NeueHaasGrotDisp-25XThin-Trial.otf
rm -f f/public/fonts/NeueMachina-Light.otf f/public/fonts/NeueMachina-Regular.otf f/public/fonts/NeueMachina-Ultrabold.otf
rm -f "f/public/fonts/Personal-license-agreement"
rm -f f/src/context/auth-context.tsx f/src/pages/Giris.tsx f/src/pages/Hakkimizda.tsx f/src/pages/Kayit.tsx f/src/pages/Listeler.tsx
rm -f scripts/nginx/kg-radio.conf scripts/nginx/lforadio.conf
rm -f setup_databases.bat
```

(Animasyon videolarının tam listesi uzunsa `rm -f f/public/animasyon/*.mp4` ile de toplu silebilirsin; repo’da yoksa sonradan tekrar koyarsın.)

### 4. Pull ve deploy

```bash
git pull
sed -i 's/\r$//' deploy.sh
./deploy.sh
```

### 5. Server .env’i geri al

`.env` silinmediyse bir şey yapma. Silindiyse:

```bash
cp -a b/.env.server.backup b/.env
```

Server’da DB şifresi `3''Ironwise3''` ise `b/.env` içinde şunlar olsun (DATABASE_URL **olmasın**):

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=3''Ironwise3''
DB_NAME=lforadio
```

---

## Seçenek B – Pull yapmadan sadece deploy çalıştır

Sadece mevcut sunucu dosyalarıyla deploy script’ini çalıştıracaksan:

```bash
cd /var/www/lforadio
sed -i 's/\r$//' deploy.sh
./deploy.sh
```

Bu durumda repo’daki son kod gelmez; sadece CRLF hatası giderilir ve deploy adımları (npm install, build, nginx vb.) çalışır.

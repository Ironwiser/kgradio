@echo off
echo LFO Radio veritabani olusturuluyor ve sema uygulaniyor...

REM PostgreSQL bin klasorunun yolunu ayarla
set PGPATH=C:\Program Files\PostgreSQL\17\bin

REM PostgreSQL sifresi (Pratik ile ayni)
set PGPASSWORD=devbros123

REM Batch'in bulundugu dizin = proje kokunu
set LFOROOT=%~dp0
set LFOROOT=%LFOROOT:~0,-1%

REM 1. lforadio veritabanini olustur
echo lforadio veritabani olusturuluyor...
"%PGPATH%\psql.exe" -h localhost -p 5432 -U postgres -d postgres -c "CREATE DATABASE lforadio WITH ENCODING = 'UTF8' LOCALE_PROVIDER = icu ICU_LOCALE = 'tr-TR' TEMPLATE = template0;"
if errorlevel 1 (
    echo UYARI: lforadio zaten var veya CREATE DATABASE basarisiz. Tablolar uygulanmaya devam ediliyor...
)

REM 2. Semayi uygula (plans, users, seed, view)
echo Tablolar ve seed verisi uygulaniyor...
cd /d "%LFOROOT%\b\sql"
"%PGPATH%\psql.exe" -h localhost -p 5432 -U postgres -d lforadio -f run_all.sql
if errorlevel 1 (
    echo HATA: run_all.sql calistirilirken hata olustu.
    set PGPASSWORD=
    pause
    exit /b 1
)

REM Sifreyi temizle
set PGPASSWORD=

echo Tum islemler tamamlandi.
pause

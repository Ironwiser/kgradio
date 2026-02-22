--
-- LFO Radio veritabanını oluşturur (PostgreSQL superuser ile çalıştırın).
-- Pratik'teki pratik.sql / tropik.sql ile aynı mantık.
-- Örnek: psql -U postgres -f 00_create_database.sql
--

CREATE DATABASE lforadio
  WITH
    ENCODING = 'UTF8'
    LOCALE_PROVIDER = icu
    ICU_LOCALE = 'tr-TR'
    TEMPLATE = template0;

# Backend ve AzuraCast Kontrol Notları

Kontrol tarihi: 8 Ağustos 2026

## Öncelikli sorunlar

1. Production başlangıcı: Express 5.2.1 altında `b/server.js` içindeki `app.get("*")` rotası `Missing parameter name at index 1: *` hatasıyla backend'i durduruyor.
2. Canlı TLS: `lforadio.omurgenc.dev` ve `radio.lforadio.omurgenc.dev` DNS üzerinden `69.62.115.159` adresine çözülüyor; ancak HTTPS bağlantısı `ERR_SSL_TLSV1_UNRECOGNIZED_NAME` ile kapanıyor. Nginx SNI ve sertifika kurulumu kontrol edilmeli.
3. CORS: `origin: true` ve `credentials: true` birlikte tüm origin'leri kabul ediyor. Production'da izin verilen domain listesi kullanılmalı.
4. Hata sızıntısı: Kayıt, giriş ve profil API'leri bazı dahili hata mesajlarını istemciye gönderiyor.
5. Bağımlılıklar: Backend `npm audit` sonucunda 1 kritik, 10 yüksek ve 3 orta seviye açık raporlandı.
6. Stream dayanıklılığı: Range değerleri doğrulanmıyor; `/api/audio/file/:filename` endpointinde byte-range desteği bulunmuyor.

## Sağlıklı kontroller

- PostgreSQL bağlantısı ve `SELECT 1` testi başarılı.
- Development modunda `/api/audio/list`, `/api/audio/current` ve `/api/animasyon/list` 200 yanıt veriyor.
- Yerel MP3 dosyaları bulunuyor ve metadata okunuyor.
- `b/.env` Git dışında tutuluyor.

## Önerilen çalışma sırası

1. Express production fallback rotasını düzelt.
2. Sunucudaki nginx ve SSL/SNI kurulumunu doğrula.
3. Kritik/yüksek bağımlılık açıklarını güncelle veya bağımlılıkları değiştir.
4. CORS allowlist ve güvenli hata yanıtlarını uygula.
5. Stream range doğrulamasını ve `/api/audio/file` seeking desteğini ekle.

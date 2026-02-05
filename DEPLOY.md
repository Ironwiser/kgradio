# KG Radio – Canlı Adres ve Deployment

**Canlı adres:** https://kg-radio.omurgenc.dev

---

## Sunucuda Çalıştırma (kg-radio.omurgenc.dev)

1. **DNS:** `kg-radio.omurgenc.dev` A kaydı sunucu IP’sine (örn. 69.62.115.159) yönlendirilmeli. İsterseniz paneldeki port (14400) için reverse proxy kullanın veya uygulamayı doğrudan 80/443’te çalıştırın.

2. **Projeyi sunucuya alın:**
   ```bash
   git clone <repo-url> kerem && cd kerem
   # veya dosyaları SCP/FTP ile kopyalayın
   ```

3. **Bağımlılıklar ve build:**
   ```bash
   cd f && npm ci && npm run build && cd ..
   cd b && npm ci && cd ..
   ```

4. **Backend’i çalıştırın (tek portta site + API):**
   ```bash
   cd b
   NODE_ENV=production PORT=14400 node server.js
   ```
   Port 14400 yerine 80 veya nginx’in proxy yaptığı portu da kullanabilirsiniz.

5. **HTTPS (önerilir):** Nginx veya Caddy ile `kg-radio.omurgenc.dev` için SSL (Let’s Encrypt) açın; 80/443’ü bu uygulamaya proxy edin. Örnek nginx:
   ```nginx
   server {
     server_name kg-radio.omurgenc.dev;
     location / {
       proxy_pass http://127.0.0.1:14400;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

6. **Sürekli çalışması için:** `pm2`, `systemd` veya panelin process manager’ı ile `NODE_ENV=production PORT=14400 node b/server.js` komutunu sürekli çalışır hale getirin.

---

## Tek tıkla redeploy

Kod güncelledikten sonra (git pull veya WinSCP ile atıp) sunucuda proje kökünden:

```bash
bash scripts/deploy.sh
```

Script: frontend build + backend npm ci + pm2 restart (pm2 yoksa sadece ne yapmanız gerektiğini yazar). Pratik kadar karmaşık değil; tek script.

---

## Özet

| Ayar        | Değer                          |
|------------|---------------------------------|
| Tam adres  | https://kg-radio.omurgenc.dev   |
| Frontend   | `f/` build → `f/dist` (backend sunar) |
| Backend    | `b/server.js` (API + static)    |
| Port       | 14400 (veya proxy’nin dinlediği port) |

API ve tüm sayfalar aynı origin’den sunulduğu için ekstra `VITE_*` ayarı gerekmez; `/api` istekleri otomatik olarak aynı domaine gider.

# LFO Radio PostgreSQL Şeması

Pratik projesindeki gibi **ilişkili (normalize) şema** kullanılır:

- **Lookup tablolar:** Sabit seçenekler tek yerde tutulur (örn. `plans`: 1=Ücretsiz, 2=Premium).
- **Ana tablolar:** Sadece ID saklar (örn. `users.plan_id` → `plans.id`); metin/istatistik JOIN ile alınır.

## Avantajlar

- Tutarlı veri: Plan adı tek yerde, yazım hatası yok.
- İstatistik: `GROUP BY plan_id` veya `JOIN plans` ile raporlama kolay.
- Genişleme: Yeni plan eklemek için sadece `plans` tablosuna satır eklenir, kod değişmez.

## Çalıştırma sırası

1. Veritabanı oluştur: `00_create_database.sql` (isteğe bağlı, bir kez)
2. Tablolar: `Tables/plans_table.sql` → `Tables/users_table.sql`
3. Varsayılan veri: `Seed/01_plans_seed.sql`

Tek komutta: `psql -U postgres -d lforadio -f sql/run_all.sql` (run_all.sql tüm dosyaları sırayla çağırır).

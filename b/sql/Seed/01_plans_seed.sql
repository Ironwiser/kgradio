--
-- Varsayılan planlar (lookup verisi). ID'ler sabit kullanılır: 1=Ücretsiz, 2=Premium
--

INSERT INTO plans (id, name, slug, description, is_active)
VALUES
    (1, 'Ücretsiz', 'free', 'Yayını dinleyebilir.', true),
    (2, 'Premium', 'premium', 'İleride ek özellikler.', true)
ON CONFLICT (id) DO NOTHING;

-- SERIAL sequence'i 2'nin üzerine taşı (yeni plan eklersek 3, 4... gider)
SELECT setval(pg_get_serial_sequence('plans', 'id'), (SELECT COALESCE(MAX(id), 1) FROM plans));

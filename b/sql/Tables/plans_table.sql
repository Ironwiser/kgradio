--
-- Lookup tablosu: Abonelik planları (Pratik'teki dovizler mantığı)
-- Başka tablolar plan_id ile bu tabloya referans verir; 1=Ücretsiz, 2=Premium
--

CREATE TABLE IF NOT EXISTS plans (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    slug        VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE plans IS 'Abonelik planları lookup tablosu; users.plan_id bu tabloya referans verir.';

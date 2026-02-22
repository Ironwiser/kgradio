--
-- Kullanıcılar: Auth + plan ilişkisi (plan_id → plans.id)
--

CREATE TABLE IF NOT EXISTS users (
    id                SERIAL PRIMARY KEY,
    email             VARCHAR(255) NOT NULL UNIQUE,
    username          VARCHAR(100) NOT NULL,
    password_hash     VARCHAR(255),
    plan_id           INTEGER NOT NULL DEFAULT 1 REFERENCES plans(id),
    email_verified_at TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- İstatistik ve listeleme için index
CREATE INDEX IF NOT EXISTS idx_users_plan_id ON users(plan_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

COMMENT ON COLUMN users.password_hash IS 'bcrypt hash; Google ile girişte NULL olabilir.';
COMMENT ON COLUMN users.plan_id IS '1=Ücretsiz, 2=Premium; plans tablosundan JOIN ile isim alınır.';

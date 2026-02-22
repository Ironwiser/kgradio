--
-- Kullanıcı listesi + plan adı (Pratik'teki dovizler JOIN mantığı)
-- users.plan_id = 1 veya 2 iken bu view ile plan adı/slug alınır
--

CREATE OR REPLACE VIEW vw_users_with_plan AS
SELECT
    u.id,
    u.email,
    u.username,
    u.plan_id,
    p.name  AS plan_name,
    p.slug  AS plan_slug,
    u.email_verified_at,
    u.created_at,
    u.updated_at
FROM users u
LEFT JOIN plans p ON p.id = u.plan_id;

--
-- Tüm şemayı sırayla uygular. Kullanım:
--   psql -U postgres -d lforadio -f run_all.sql
-- Önce veritabanı yoksa: psql -U postgres -f 00_create_database.sql
-- Sonra: psql -U postgres -d lforadio -f run_all.sql
--

\ir Tables/plans_table.sql
\ir Tables/users_table.sql
\ir Seed/01_plans_seed.sql
\ir Views/vw_users_with_plan.sql

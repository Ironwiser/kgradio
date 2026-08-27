ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'listener';

CREATE TABLE IF NOT EXISTS soundcloud_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  lowradio_profile_url TEXT,
  lowradio_profile_name TEXT,
  lowradio_artwork_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS soundcloud_artists (
  id SERIAL PRIMARY KEY,
  profile_url TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  artwork_url TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS soundcloud_items (
  id SERIAL PRIMARY KEY,
  scope VARCHAR(20) NOT NULL CHECK (scope IN ('lowradio', 'partner')),
  artist_id INTEGER REFERENCES soundcloud_artists(id) ON DELETE CASCADE,
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('track', 'playlist')),
  soundcloud_url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  author_name TEXT,
  artwork_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((scope = 'partner' AND artist_id IS NOT NULL) OR scope = 'lowradio')
);

CREATE INDEX IF NOT EXISTS idx_soundcloud_items_catalog
  ON soundcloud_items(scope, active, sort_order);
CREATE INDEX IF NOT EXISTS idx_soundcloud_artists_catalog
  ON soundcloud_artists(active, sort_order);

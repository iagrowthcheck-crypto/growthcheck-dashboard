CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'inactivo' CHECK (status IN ('activo', 'inactivo')),
  wix_event_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS magic_link_tokens (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

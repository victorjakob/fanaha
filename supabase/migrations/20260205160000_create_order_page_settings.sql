-- Order page settings (e.g. next opening date)
CREATE TABLE IF NOT EXISTS fanaha_order_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE fanaha_order_settings DISABLE ROW LEVEL SECURITY;

INSERT INTO fanaha_order_settings (key, value)
VALUES ('next_opening', '2026-04-08')
ON CONFLICT (key) DO NOTHING;

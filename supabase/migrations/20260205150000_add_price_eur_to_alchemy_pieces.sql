-- Add EUR price column to alchemy pieces (in addition to ISK).
-- Idempotent + safe to run multiple times.

ALTER TABLE IF EXISTS fanaha_alchemy_pieces
  ADD COLUMN IF NOT EXISTS price_eur NUMERIC(10, 2);

COMMENT ON COLUMN fanaha_alchemy_pieces.price_eur IS 'Price in euros (€)';


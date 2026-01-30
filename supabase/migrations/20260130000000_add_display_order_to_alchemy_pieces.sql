-- Add display_order for manual ordering within each status section.
-- Intended sort: available -> commission -> sold, each ordered by display_order ASC.

ALTER TABLE IF EXISTS fanaha_alchemy_pieces
  ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Backfill display_order for existing rows that don't have it yet.
-- We match the previous public sorting behavior (most recent first):
-- year DESC (fallback to created_at year), then created_at DESC.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY section_id, COALESCE(status, 'available')
      ORDER BY
        COALESCE(year, EXTRACT(YEAR FROM created_at)) DESC,
        created_at DESC
    ) - 1 AS new_order
  FROM fanaha_alchemy_pieces
)
UPDATE fanaha_alchemy_pieces p
SET display_order = r.new_order
FROM ranked r
WHERE p.id = r.id
  AND (p.display_order IS NULL);

-- Ensure new inserts have a default
ALTER TABLE IF EXISTS fanaha_alchemy_pieces
  ALTER COLUMN display_order SET DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_alchemy_pieces_section_status_order
  ON fanaha_alchemy_pieces (section_id, COALESCE(status, 'available'), display_order);


-- Add French translation columns to content tables.
-- Strategy:
-- - Store translated values alongside existing columns using a *_fr suffix.
-- - Default to a placeholder so the admin can easily see what needs translation.
-- - Frontend will treat the placeholder as "missing" and fall back to English.

DO $$
BEGIN
  -- Central placeholder marker (stored in DB).
  -- Note: This is a value convention; Postgres doesn't enforce it beyond defaults.
END $$;

-- =========
-- fanaha_sections (CMS section headers, CTAs, etc.)
-- =========
ALTER TABLE IF EXISTS fanaha_sections
  ADD COLUMN IF NOT EXISTS title_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS description_fr TEXT DEFAULT '[NEEDS_TRANSLATION]';

UPDATE fanaha_sections
SET
  title_fr = COALESCE(NULLIF(title_fr, ''), '[NEEDS_TRANSLATION]'),
  description_fr = COALESCE(NULLIF(description_fr, ''), '[NEEDS_TRANSLATION]')
WHERE title_fr IS NULL OR description_fr IS NULL;

-- =========
-- fanaha_offerings
-- =========
ALTER TABLE IF EXISTS fanaha_offerings
  ADD COLUMN IF NOT EXISTS title_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS description_fr TEXT DEFAULT '[NEEDS_TRANSLATION]';

UPDATE fanaha_offerings
SET
  title_fr = COALESCE(NULLIF(title_fr, ''), '[NEEDS_TRANSLATION]'),
  description_fr = COALESCE(NULLIF(description_fr, ''), '[NEEDS_TRANSLATION]')
WHERE title_fr IS NULL OR description_fr IS NULL;

-- =========
-- fanaha_exhibitions
-- =========
ALTER TABLE IF EXISTS fanaha_exhibitions
  ADD COLUMN IF NOT EXISTS gallery_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS about_fr TEXT DEFAULT '[NEEDS_TRANSLATION]';

UPDATE fanaha_exhibitions
SET
  gallery_fr = COALESCE(NULLIF(gallery_fr, ''), '[NEEDS_TRANSLATION]'),
  about_fr = COALESCE(NULLIF(about_fr, ''), '[NEEDS_TRANSLATION]')
WHERE gallery_fr IS NULL OR about_fr IS NULL;

-- =========
-- fanaha_oracles_projects
-- =========
ALTER TABLE IF EXISTS fanaha_oracles_projects
  ADD COLUMN IF NOT EXISTS name_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS publisher_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS about_fr TEXT DEFAULT '[NEEDS_TRANSLATION]';

UPDATE fanaha_oracles_projects
SET
  name_fr = COALESCE(NULLIF(name_fr, ''), '[NEEDS_TRANSLATION]'),
  publisher_fr = COALESCE(NULLIF(publisher_fr, ''), '[NEEDS_TRANSLATION]'),
  about_fr = COALESCE(NULLIF(about_fr, ''), '[NEEDS_TRANSLATION]')
WHERE name_fr IS NULL OR publisher_fr IS NULL OR about_fr IS NULL;

-- =========
-- fanaha_murals
-- =========
ALTER TABLE IF EXISTS fanaha_murals
  ADD COLUMN IF NOT EXISTS location_fr TEXT DEFAULT '[NEEDS_TRANSLATION]';

UPDATE fanaha_murals
SET location_fr = COALESCE(NULLIF(location_fr, ''), '[NEEDS_TRANSLATION]')
WHERE location_fr IS NULL;

-- =========
-- fanaha_alchemy_pieces
-- =========
ALTER TABLE IF EXISTS fanaha_alchemy_pieces
  ADD COLUMN IF NOT EXISTS name_fr TEXT DEFAULT '[NEEDS_TRANSLATION]';

UPDATE fanaha_alchemy_pieces
SET name_fr = COALESCE(NULLIF(name_fr, ''), '[NEEDS_TRANSLATION]')
WHERE name_fr IS NULL;

-- =========
-- fanaha_about_content (structured content)
-- =========
ALTER TABLE IF EXISTS fanaha_about_content
  ADD COLUMN IF NOT EXISTS title_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS subtitle_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS bio_title_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS bio_paragraphs_fr JSONB DEFAULT jsonb_build_array('[NEEDS_TRANSLATION]'),
  ADD COLUMN IF NOT EXISTS pillars_fr JSONB DEFAULT jsonb_build_array(
    jsonb_build_object('title', '[NEEDS_TRANSLATION]', 'body', '[NEEDS_TRANSLATION]')
  ),
  ADD COLUMN IF NOT EXISTS milestones_fr JSONB DEFAULT jsonb_build_array(
    jsonb_build_object('year', '[NEEDS_TRANSLATION]', 'text', '[NEEDS_TRANSLATION]')
  ),
  ADD COLUMN IF NOT EXISTS quote_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS quote_author_fr TEXT DEFAULT '[NEEDS_TRANSLATION]';

UPDATE fanaha_about_content
SET
  title_fr = COALESCE(NULLIF(title_fr, ''), '[NEEDS_TRANSLATION]'),
  subtitle_fr = COALESCE(NULLIF(subtitle_fr, ''), '[NEEDS_TRANSLATION]'),
  bio_title_fr = COALESCE(NULLIF(bio_title_fr, ''), '[NEEDS_TRANSLATION]'),
  bio_paragraphs_fr = COALESCE(bio_paragraphs_fr, jsonb_build_array('[NEEDS_TRANSLATION]')),
  pillars_fr = COALESCE(
    pillars_fr,
    jsonb_build_array(jsonb_build_object('title', '[NEEDS_TRANSLATION]', 'body', '[NEEDS_TRANSLATION]'))
  ),
  milestones_fr = COALESCE(
    milestones_fr,
    jsonb_build_array(jsonb_build_object('year', '[NEEDS_TRANSLATION]', 'text', '[NEEDS_TRANSLATION]'))
  ),
  quote_fr = COALESCE(NULLIF(quote_fr, ''), '[NEEDS_TRANSLATION]'),
  quote_author_fr = COALESCE(NULLIF(quote_author_fr, ''), '[NEEDS_TRANSLATION]')
WHERE
  title_fr IS NULL OR subtitle_fr IS NULL OR bio_title_fr IS NULL
  OR bio_paragraphs_fr IS NULL OR pillars_fr IS NULL OR milestones_fr IS NULL
  OR quote_fr IS NULL OR quote_author_fr IS NULL;

-- =========
-- fanaha_homepage_slides (alt text)
-- =========
ALTER TABLE IF EXISTS fanaha_homepage_slides
  ADD COLUMN IF NOT EXISTS alt_fr TEXT DEFAULT '[NEEDS_TRANSLATION]';

UPDATE fanaha_homepage_slides
SET alt_fr = COALESCE(NULLIF(alt_fr, ''), '[NEEDS_TRANSLATION]')
WHERE alt_fr IS NULL;


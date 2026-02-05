-- Ensure French translation columns exist across content tables.
-- Idempotent: safe to run multiple times.
-- Convention: *_fr columns default to '[NEEDS_TRANSLATION]'.

-- =========
-- fanaha_sections
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
  ADD COLUMN IF NOT EXISTS city_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS country_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS about_fr TEXT DEFAULT '[NEEDS_TRANSLATION]';

UPDATE fanaha_exhibitions
SET
  gallery_fr = COALESCE(NULLIF(gallery_fr, ''), '[NEEDS_TRANSLATION]'),
  city_fr = COALESCE(NULLIF(city_fr, ''), '[NEEDS_TRANSLATION]'),
  country_fr = COALESCE(NULLIF(country_fr, ''), '[NEEDS_TRANSLATION]'),
  about_fr = COALESCE(NULLIF(about_fr, ''), '[NEEDS_TRANSLATION]')
WHERE gallery_fr IS NULL OR city_fr IS NULL OR country_fr IS NULL OR about_fr IS NULL;

-- =========
-- fanaha_oracles_projects
-- =========
ALTER TABLE IF EXISTS fanaha_oracles_projects
  ADD COLUMN IF NOT EXISTS name_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS date_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS publisher_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS about_fr TEXT DEFAULT '[NEEDS_TRANSLATION]';

UPDATE fanaha_oracles_projects
SET
  name_fr = COALESCE(NULLIF(name_fr, ''), '[NEEDS_TRANSLATION]'),
  date_fr = COALESCE(NULLIF(date_fr, ''), '[NEEDS_TRANSLATION]'),
  publisher_fr = COALESCE(NULLIF(publisher_fr, ''), '[NEEDS_TRANSLATION]'),
  about_fr = COALESCE(NULLIF(about_fr, ''), '[NEEDS_TRANSLATION]')
WHERE name_fr IS NULL OR date_fr IS NULL OR publisher_fr IS NULL OR about_fr IS NULL;

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
  ADD COLUMN IF NOT EXISTS name_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS description_fr TEXT DEFAULT '[NEEDS_TRANSLATION]',
  ADD COLUMN IF NOT EXISTS dimensions_fr TEXT DEFAULT '[NEEDS_TRANSLATION]';

UPDATE fanaha_alchemy_pieces
SET
  name_fr = COALESCE(NULLIF(name_fr, ''), '[NEEDS_TRANSLATION]'),
  description_fr = COALESCE(NULLIF(description_fr, ''), '[NEEDS_TRANSLATION]'),
  dimensions_fr = COALESCE(NULLIF(dimensions_fr, ''), '[NEEDS_TRANSLATION]')
WHERE name_fr IS NULL OR description_fr IS NULL OR dimensions_fr IS NULL;

-- =========
-- fanaha_about_content
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
-- fanaha_homepage_slides
-- =========
ALTER TABLE IF EXISTS fanaha_homepage_slides
  ADD COLUMN IF NOT EXISTS alt_fr TEXT DEFAULT '[NEEDS_TRANSLATION]';

UPDATE fanaha_homepage_slides
SET alt_fr = COALESCE(NULLIF(alt_fr, ''), '[NEEDS_TRANSLATION]')
WHERE alt_fr IS NULL;

-- =========
-- fanaha_reviews
-- =========
ALTER TABLE IF EXISTS fanaha_reviews
  ADD COLUMN IF NOT EXISTS review_text_fr TEXT DEFAULT '[NEEDS_TRANSLATION]';

UPDATE fanaha_reviews
SET review_text_fr = COALESCE(NULLIF(review_text_fr, ''), '[NEEDS_TRANSLATION]')
WHERE review_text_fr IS NULL;


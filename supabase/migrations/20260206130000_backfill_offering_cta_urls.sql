-- Backfill cta_see_more_url and cta_get_yours_url for existing offerings
UPDATE fanaha_offerings
SET
  cta_see_more_url = COALESCE(
    cta_see_more_url,
    CASE
      WHEN LOWER(COALESCE(title, '')) LIKE '%alchemical art%' OR LOWER(COALESCE(title, '')) LIKE '%commission%' THEN '/alchemy'
      WHEN LOWER(COALESCE(title, '')) LIKE '%altar%' THEN '/altar'
      WHEN LOWER(COALESCE(title, '')) LIKE '%mural%' THEN '/murals'
      WHEN LOWER(COALESCE(title, '')) LIKE '%oracle%' OR LOWER(COALESCE(title, '')) LIKE '%project%' THEN '/oracles-projects'
      WHEN LOWER(COALESCE(title, '')) LIKE '%grand scale%' OR LOWER(COALESCE(title, '')) LIKE '%grandscale%' OR LOWER(COALESCE(title, '')) LIKE '%personal creation%' THEN NULL
      ELSE '/contact'
    END
  ),
  cta_get_yours_url = COALESCE(cta_get_yours_url, '/order')
WHERE cta_see_more_url IS NULL OR cta_get_yours_url IS NULL;

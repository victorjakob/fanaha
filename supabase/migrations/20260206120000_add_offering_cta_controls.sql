-- Add columns to control which CTA buttons each offering shows
ALTER TABLE fanaha_offerings
  ADD COLUMN IF NOT EXISTS show_see_more boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_get_yours boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS cta_see_more_url text,
  ADD COLUMN IF NOT EXISTS cta_get_yours_url text;

COMMENT ON COLUMN fanaha_offerings.show_see_more IS 'If true, show the See More button';
COMMENT ON COLUMN fanaha_offerings.show_get_yours IS 'If true, show the Get Yours button';
COMMENT ON COLUMN fanaha_offerings.cta_see_more_url IS 'Custom URL for See More (empty = derive from title)';
COMMENT ON COLUMN fanaha_offerings.cta_get_yours_url IS 'Custom URL for Get Yours (empty = /order)';

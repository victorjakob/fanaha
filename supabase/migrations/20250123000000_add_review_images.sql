-- Add image support for reviews
ALTER TABLE IF EXISTS fanaha_reviews
  ADD COLUMN IF NOT EXISTS images_public_ids TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';

COMMENT ON COLUMN fanaha_reviews.images_public_ids IS 'Cloudinary public_ids for review images (ordered)';
COMMENT ON COLUMN fanaha_reviews.images IS 'Full image URLs for backward compatibility';

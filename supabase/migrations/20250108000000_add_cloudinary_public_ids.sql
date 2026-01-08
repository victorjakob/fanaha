-- Add Cloudinary public_id columns for image optimization
-- This migration adds new columns while keeping existing image URL columns intact
-- This ensures backward compatibility - existing Supabase images continue working

-- Alchemy pieces: Add public_id columns for main image and gallery images
ALTER TABLE fanaha_alchemy_pieces 
ADD COLUMN IF NOT EXISTS main_image_public_id TEXT,
ADD COLUMN IF NOT EXISTS images_public_ids TEXT[];

COMMENT ON COLUMN fanaha_alchemy_pieces.main_image_public_id IS 'Cloudinary public_id for optimized main image';
COMMENT ON COLUMN fanaha_alchemy_pieces.images_public_ids IS 'Array of Cloudinary public_ids for optimized gallery images';

-- Altar artworks: Add public_id column (check actual table name)
ALTER TABLE fanaha_altar_artworks 
ADD COLUMN IF NOT EXISTS image_public_id TEXT;

COMMENT ON COLUMN fanaha_altar_artworks.image_public_id IS 'Cloudinary public_id for optimized image';

-- Murals: Add public_id column for images array (check actual table name)
ALTER TABLE fanaha_murals 
ADD COLUMN IF NOT EXISTS images_public_ids TEXT[];

COMMENT ON COLUMN fanaha_murals.images_public_ids IS 'Array of Cloudinary public_ids for optimized images';

-- Exhibitions: Add public_id column for images array (check actual table name)
ALTER TABLE fanaha_exhibitions 
ADD COLUMN IF NOT EXISTS images_public_ids TEXT[];

COMMENT ON COLUMN fanaha_exhibitions.images_public_ids IS 'Array of Cloudinary public_ids for optimized images';

-- Oracles projects: Add public_id column for images array (check actual table name)
ALTER TABLE fanaha_oracles_projects 
ADD COLUMN IF NOT EXISTS images_public_ids TEXT[];

COMMENT ON COLUMN fanaha_oracles_projects.images_public_ids IS 'Array of Cloudinary public_ids for optimized images';

-- Offerings: Add public_id column (check actual table name)
ALTER TABLE fanaha_offerings 
ADD COLUMN IF NOT EXISTS image_public_id TEXT;

COMMENT ON COLUMN fanaha_offerings.image_public_id IS 'Cloudinary public_id for optimized image';

-- Note: Existing columns (main_image, images, image_url) remain unchanged
-- This allows for gradual migration and backward compatibility

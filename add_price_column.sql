-- Add price column to alchemy_pieces table
-- Run this in your Supabase SQL Editor

ALTER TABLE alchemy_pieces 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

-- Add comment to document the price field
COMMENT ON COLUMN alchemy_pieces.price IS 'Price in Icelandic Króna (ISK)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'alchemy_pieces' AND column_name = 'price'; 
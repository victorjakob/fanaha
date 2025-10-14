-- Run this SQL in your Supabase SQL Editor
-- This adds the 'year' column to the alchemy_pieces table

ALTER TABLE alchemy_pieces 
ADD COLUMN IF NOT EXISTS year INTEGER;

-- Add comment to document the year field
COMMENT ON COLUMN alchemy_pieces.year IS 'Year the art piece was created';

-- Optional: Set default year for existing pieces (current year)
-- Uncomment the line below if you want to set a default year for existing pieces
-- UPDATE alchemy_pieces SET year = EXTRACT(YEAR FROM created_at) WHERE year IS NULL;


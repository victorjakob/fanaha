-- Add year column to alchemy_pieces table
ALTER TABLE alchemy_pieces 
ADD COLUMN year INTEGER;

-- Add comment to document the year field
COMMENT ON COLUMN alchemy_pieces.year IS 'Year the art piece was created';


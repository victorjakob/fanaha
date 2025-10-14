-- Add price column to alchemy_pieces table
ALTER TABLE alchemy_pieces 
ADD COLUMN price DECIMAL(10,2);

-- Add comment to document the price field
COMMENT ON COLUMN alchemy_pieces.price IS 'Price in euros (€)';


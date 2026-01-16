-- Create reviews table for client/owner feedback
CREATE TABLE IF NOT EXISTS fanaha_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  review_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE fanaha_reviews IS 'Stores client and owner reviews/feedback';
COMMENT ON COLUMN fanaha_reviews.rating IS 'Optional rating from 1 to 5 stars';
COMMENT ON COLUMN fanaha_reviews.display_order IS 'Order in which reviews are displayed (lower numbers first)';

-- Disable RLS for simplicity
ALTER TABLE fanaha_reviews DISABLE ROW LEVEL SECURITY;

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_reviews_display_order ON fanaha_reviews(display_order ASC, created_at DESC);

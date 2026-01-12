-- Create tables for orders and contact submissions
-- These tables store all order requests and contact form submissions

-- Orders table for commission requests
CREATE TABLE IF NOT EXISTS fanaha_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  art_piece_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE fanaha_orders IS 'Stores all commission/order requests from the website';
COMMENT ON COLUMN fanaha_orders.status IS 'Order status: pending, in_progress, completed, cancelled';

-- Contact submissions table
CREATE TABLE IF NOT EXISTS fanaha_contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE fanaha_contact_submissions IS 'Stores all contact form submissions from the website';

-- Disable RLS on these tables (consistent with other fanaha_ tables)
ALTER TABLE fanaha_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE fanaha_contact_submissions DISABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON fanaha_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON fanaha_orders(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON fanaha_contact_submissions(created_at DESC);

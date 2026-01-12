-- Disable Row Level Security (RLS) on all fanaha_ tables
-- This simplifies access control - all tables are publicly accessible
-- Note: This is a security trade-off for simplicity

-- Disable RLS on all fanaha_ tables
ALTER TABLE IF EXISTS fanaha_alchemy_pieces DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fanaha_altar_artworks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fanaha_murals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fanaha_exhibitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fanaha_oracles_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fanaha_offerings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fanaha_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fanaha_homepage_slides DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fanaha_about_content DISABLE ROW LEVEL SECURITY;

-- Drop any existing RLS policies (optional cleanup)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename LIKE 'fanaha_%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

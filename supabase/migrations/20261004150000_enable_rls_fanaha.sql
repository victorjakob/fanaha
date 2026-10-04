-- Turn row level security back on for every Fanaha table.
-- The website reads and writes through the server (service role, which bypasses RLS);
-- the browser only ever reads public content (e.g. the footer section) with the anon key.
-- Orders and contact submissions get no policy at all: nobody but the server can read them.
do $$
declare t text;
begin
  foreach t in array array[
    'fanaha_about_content','fanaha_alchemy_pieces','fanaha_altar_artworks','fanaha_exhibitions',
    'fanaha_homepage_slides','fanaha_murals','fanaha_offerings','fanaha_oracles_projects',
    'fanaha_order_settings','fanaha_reviews','fanaha_sections'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Public can read" on public.%I', t);
    execute format('create policy "Public can read" on public.%I for select to anon, authenticated using (true)', t);
  end loop;
  foreach t in array array['fanaha_orders','fanaha_contact_submissions'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

import { createServerSupabase } from "@/util/supabase/server";
import { getSiteUrl } from "@/lib/seo";

const STATIC_PATHS = [
  "",
  "/about",
  "/alchemy",
  "/altar",
  "/murals",
  "/exhibitions",
  "/oracles-projects",
  "/what-i-offer",
  "/reviews",
  "/contact",
  "/order",
];
const LOCALES = ["en", "fr"];

function buildLocalizedRoutes() {
  const base = getSiteUrl();
  return STATIC_PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
    }))
  );
}

export default async function sitemap() {
  const routes = buildLocalizedRoutes();

  try {
    const supabase = createServerSupabase();
    const { data: pieces, error } = await supabase
      .from("fanaha_alchemy_pieces")
      .select("slug, updated_at, created_at");

    if (error || !pieces) {
      return routes;
    }

    const base = getSiteUrl();
    const dynamicRoutes = pieces.flatMap((piece) =>
      LOCALES.map((locale) => ({
        url: `${base}/${locale}/alchemy/${piece.slug}`,
        lastModified:
          piece.updated_at || piece.created_at
            ? new Date(piece.updated_at || piece.created_at)
            : new Date(),
      }))
    );

    return [...routes, ...dynamicRoutes];
  } catch (error) {
    return routes;
  }
}

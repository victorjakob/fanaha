import { createServerSupabase } from "@/util/supabase/server";
import { pickLocalizedText } from "@/lib/db-i18n";

export async function getSlides(locale = "en") {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("fanaha_homepage_slides")
    .select("*")
    .eq("active", true)
    .order("sort", { ascending: true });

  if (error) {
    return {
      desktop: [],
      mobile: [],
    };
  }

  const localized = data.map((d) => ({
    ...d,
    alt: pickLocalizedText(d, "alt", locale),
  }));

  return {
    desktop: localized.filter((d) => d.target === "desktop"),
    mobile: localized.filter((d) => d.target === "mobile"),
  };
}

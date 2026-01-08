import { createServerSupabase } from "@/util/supabase/server";

export async function getSlides() {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("fanaha_homepage_slides")
    .select("public_id, alt, target, sort, active")
    .eq("active", true)
    .order("sort", { ascending: true });

  if (error) {
    console.error("Error fetching slides:", error);
    return {
      desktop: [],
      mobile: [],
    };
  }

  return {
    desktop: data.filter((d) => d.target === "desktop"),
    mobile: data.filter((d) => d.target === "mobile"),
  };
}

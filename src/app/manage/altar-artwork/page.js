import { createServerSupabase } from "@/util/supabase/server";
import AltarManageClient from "./AltarManageClient";

export const dynamic = "force-dynamic";

export default async function AltarManagePage() {
  const supabase = createServerSupabase();

  // Get the section
  const { data: section } = await supabase
    .from("fanaha_sections")
    .select("*")
    .eq("slug", "altar-artwork")
    .single();

  // Fetch altar artworks
  const { data: artworks, error } = await supabase
    .from("fanaha_altar_artworks")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching altar artworks:", error);
    console.error("Error details:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  console.log("Fetched altar artworks:", artworks?.length || 0, "items");

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <AltarManageClient initialArtworks={artworks || []} section={section} />
    </div>
  );
}

import { createServerSupabase } from "@/util/supabase/server";
import MuralsManageClient from "./MuralsManageClient";

export default async function MuralsManagePage() {
  const supabase = createServerSupabase();

  // Get the section
  const { data: section } = await supabase
    .from("sections")
    .select("*")
    .eq("slug", "murals")
    .single();

  // Fetch murals
  const { data: murals, error } = await supabase
    .from("murals")
    .select("*")
    .order("year", { ascending: false })
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching murals:", error);
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <MuralsManageClient initialMurals={murals || []} section={section} />
    </div>
  );
}

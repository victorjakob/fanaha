import { createServerSupabase } from "@/util/supabase/server";
import ExhibitionsManageClient from "./ExhibitionsManageClient";

export default async function ExhibitionsManagePage() {
  const supabase = createServerSupabase();

  // Get the section
  const { data: section } = await supabase
    .from("sections")
    .select("*")
    .eq("slug", "exhibitions")
    .single();

  // Fetch exhibitions
  const { data: exhibitions, error } = await supabase
    .from("exhibitions")
    .select("*")
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching exhibitions:", error);
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <ExhibitionsManageClient
        initialExhibitions={exhibitions || []}
        section={section}
      />
    </div>
  );
}

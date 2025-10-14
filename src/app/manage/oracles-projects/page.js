import { createServerSupabase } from "@/util/supabase/server";
import OraclesProjectsManageClient from "./OraclesProjectsManageClient";

export default async function OraclesProjectsManagePage() {
  const supabase = createServerSupabase();

  // Get the section
  const { data: section } = await supabase
    .from("sections")
    .select("*")
    .eq("slug", "oracles-projects")
    .single();

  // Fetch items
  const { data: items, error } = await supabase
    .from("oracles_projects")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching oracles & projects:", error);
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <OraclesProjectsManageClient
        initialItems={items || []}
        section={section}
      />
    </div>
  );
}

import { createServerSupabase } from "@/util/supabase/server";
import AboutManageClient from "./AboutManageClient";

export default async function AboutManagePage() {
  const supabase = createServerSupabase();

  // Fetch the about content (there should only be one row)
  const { data: content, error } = await supabase
    .from("about_content")
    .select("*")
    .single();

  if (error) {
    console.error("Error fetching about content:", error);
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <AboutManageClient content={content || {}} />
    </div>
  );
}

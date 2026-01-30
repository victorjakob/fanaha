import { createServerSupabase } from "@/util/supabase/server";
import AboutManageClient from "./AboutManageClient";

export const dynamic = 'force-dynamic';

export default async function AboutManagePage() {
  const supabase = createServerSupabase();

  // Fetch the about content (there should only be one row)
  const { data: content, error } = await supabase
    .from("fanaha_about_content")
    .select("*")
    .single();

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <AboutManageClient content={content || {}} />
    </div>
  );
}


import { createServerSupabase } from "@/util/supabase/server";
import ContentManageClient from "./ContentManageClient";

export default async function ContentManagePage() {
  const supabase = createServerSupabase();
  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .order("display_order", { ascending: true });

  return <ContentManageClient sections={sections || []} />;
}



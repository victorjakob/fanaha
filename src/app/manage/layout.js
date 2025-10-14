import { createServerSupabase } from "@/util/supabase/server";
import ManageNav from "./ManageNav";

export default async function ManageLayout({ children }) {
  const supabase = createServerSupabase();
  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      <ManageNav sections={sections || []} />
      <div className="pt-24">{children}</div>
    </div>
  );
}



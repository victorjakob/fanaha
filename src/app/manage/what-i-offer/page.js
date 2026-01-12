import { createServerSupabase } from "@/util/supabase/server";
import OfferingsManageClient from "./OfferingsManageClient";

export const dynamic = 'force-dynamic';

export default async function OfferingsManagePage() {
  const supabase = createServerSupabase();

  // Get the section
  const { data: section } = await supabase
    .from("fanaha_sections")
    .select("*")
    .eq("slug", "what-i-offer")
    .single();

  // Fetch offerings
  const { data: offerings, error } = await supabase
    .from("fanaha_offerings")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching offerings:", error);
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <OfferingsManageClient
        initialOfferings={offerings || []}
        section={section}
      />
    </div>
  );
}


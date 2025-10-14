import { createServerSupabase } from "@/util/supabase/server";
import { notFound } from "next/navigation";
import ManageClient from "../ManageClient";

export default async function SectionManagePage({ params }) {
  const { section: sectionSlug } = await params;
  const supabase = createServerSupabase();
  
  // Get the section
  const { data: section } = await supabase
    .from("sections")
    .select("*")
    .eq("slug", sectionSlug)
    .single();

  if (!section) {
    return notFound();
  }

  // Fetch art pieces for this section
  const { data: artPieces, error } = await supabase
    .from("alchemy_pieces")
    .select("*")
    .eq("section_id", section.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching art pieces:", error);
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <ManageClient 
        initialPieces={artPieces || []} 
        section={section}
      />
    </div>
  );
}



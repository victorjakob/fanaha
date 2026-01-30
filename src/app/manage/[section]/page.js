import { createServerSupabase } from "@/util/supabase/server";
import { notFound } from "next/navigation";
import ManageClient from "../ManageClient";

export const dynamic = 'force-dynamic';

export default async function SectionManagePage({ params }) {
  const { section: sectionSlug } = await params;
  const supabase = createServerSupabase();
  
  // Block access to footer-cta
  if (sectionSlug === "footer-cta") {
    return notFound();
  }
  
  // Get the section
  const { data: section } = await supabase
    .from("fanaha_sections")
    .select("*")
    .eq("slug", sectionSlug)
    .single();

  if (!section) {
    return notFound();
  }

  // Fetch art pieces for this section
  const { data: artPieces, error } = await supabase
    .from("fanaha_alchemy_pieces")
    .select("*")
    .eq("section_id", section.id)
    .order("created_at", { ascending: false });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <ManageClient 
        initialPieces={artPieces || []} 
        section={section}
      />
    </div>
  );
}



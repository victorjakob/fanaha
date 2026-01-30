import { notFound } from "next/navigation";
import { createServerSupabase } from "@/util/supabase/server";
import AlchemyArtPieceDetailClient from "./Client";

// Revalidate every 60 seconds to ensure fresh content
export const revalidate = 60;

export default async function AlchemyArtPieceDetail({ params }) {
  const { slug } = await params;
  const supabase = createServerSupabase();

  // Fetch by slug
  const { data: piece, error } = await supabase
    .from("fanaha_alchemy_pieces")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!piece || error) {
    return notFound();
  }

  return <AlchemyArtPieceDetailClient piece={piece} />;
}

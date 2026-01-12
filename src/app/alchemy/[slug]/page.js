import { notFound } from "next/navigation";
import { createServerSupabase } from "@/util/supabase/server";
import AlchemyArtPieceDetailClient from "./Client";

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
    if (error) {
      console.error("Error fetching art piece:", error);
    }
    return notFound();
  }

  return <AlchemyArtPieceDetailClient piece={piece} />;
}

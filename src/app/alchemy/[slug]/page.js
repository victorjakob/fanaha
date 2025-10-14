import { notFound } from "next/navigation";
import { supabase } from "../../../util/supabase/supabaseClient";
import AlchemyArtPieceDetailClient from "./Client";

export default async function AlchemyArtPieceDetail({ params }) {
  const { slug } = await params;
  // Fetch by slug
  const { data: piece, error } = await supabase
    .from("alchemy_pieces")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!piece || error) return notFound();

  return <AlchemyArtPieceDetailClient piece={piece} />;
}

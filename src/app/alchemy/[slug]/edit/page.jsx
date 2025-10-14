import { notFound } from "next/navigation";
import { createServerSupabase } from "../../../../util/supabase/server";
import EditForm from "./EditForm";

export default async function EditAlchemyArtPiecePage({ params }) {
  const { slug } = await params;
  const supabase = createServerSupabase();
  const { data: piece, error } = await supabase
    .from("alchemy_pieces")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!piece || error) return notFound();

  return (
    <main className="flex flex-col items-center w-full min-h-screen pt-23 py-12 px-4 sm:px-8">
      <section className="w-full max-w-2xl text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Edit Art Piece</h1>
      </section>
      <EditForm piece={piece} />
    </main>
  );
}

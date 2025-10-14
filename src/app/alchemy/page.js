import AlchemyHeader from "./Header";
import AlchemyGallery from "./Gallery";
import { createServerSupabase } from "@/util/supabase/server";
import Image from "next/image";

export default async function AlchemyPage() {
  const supabase = createServerSupabase();

  // Fetch section content
  const { data: sectionContent } = await supabase
    .from("sections")
    .select("title, description")
    .eq("slug", "alchemical-art-pieces")
    .single();

  // Fetch art pieces
  const { data: artPieces, error } = await supabase
    .from("alchemy_pieces")
    .select(
      "id, slug, name, images, created_at, dimensions, palette, price, status"
    )
    .order("created_at", { ascending: false });

  // Sort: available first, then commission, then sold, all by date created (desc)
  const sorted = artPieces
    ? [
        ...artPieces
          .filter((a) => a.status === "available")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        ...artPieces
          .filter((a) => a.status === "commission")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        ...artPieces
          .filter((a) => a.status === "sold")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
      ]
    : [];

  return (
    <main className="relative flex flex-col items-center w-full min-h-screen pt-32 sm:pt-40 py-6 sm:py-12 px-2 sm:px-8 overflow-hidden">
      {/* Full-screen runes background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/runes-bg2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.08,
        }}
      />
      {/* Background Decorative Image - Left */}
      <div
        className="hidden xl:block fixed left-0 top-0 h-full w-96 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752181981/border-right1_y9hahn.png')`,
          backgroundRepeat: "repeat-y",
          backgroundSize: "100px auto",
          backgroundPosition: "left center",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Background Decorative Image - Right */}
      <div
        className="hidden xl:block fixed right-0 top-0 h-full w-96 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752181981/border-right1_y9hahn.png')`,
          backgroundRepeat: "repeat-y",
          backgroundSize: "100px auto",
          backgroundPosition: "right center",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <AlchemyHeader
          title={sectionContent?.title || "Alchemical Art Pieces"}
          description={
            sectionContent?.description ||
            "Explore a collection of unique, mystical alchemical artworks."
          }
        />
        <AlchemyGallery artPieces={sorted} />
      </div>
    </main>
  );
}

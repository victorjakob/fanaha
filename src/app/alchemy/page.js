import AlchemyHeader from "./Header";
import AlchemyGallery from "./Gallery";
import { createServerSupabase } from "@/util/supabase/server";
import Image from "next/image";

// Revalidate every 60 seconds to ensure fresh content
export const revalidate = 60;

export default async function AlchemyPage() {
  const supabase = createServerSupabase();

  // Fetch section content
  const { data: sectionContent } = await supabase
    .from("fanaha_sections")
    .select("title, description")
    .eq("slug", "alchemical-art-pieces")
    .single();

  // Fetch art pieces
  const { data: artPieces, error } = await supabase
    .from("fanaha_alchemy_pieces")
    .select(
      "id, slug, name, images, created_at, dimensions, palette, price, status, year"
    )
    .order("created_at", { ascending: false });

  // Log error in production for debugging
  if (error) {
    console.error("Error fetching art pieces:", error);
    console.error("Error details:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  // Log data for debugging
  console.log("Fetched art pieces:", artPieces?.length || 0, "items");
  if (artPieces && artPieces.length > 0) {
    console.log("Art pieces statuses:", artPieces.map(p => ({ id: p.id, status: p.status })));
  }

  // Sort: available first, then commission, then sold, all by year (desc - most recent first)
  // Handle items without status by defaulting to "available"
  // If year is null, fall back to created_at for sorting
  const sorted = artPieces
    ? [
        ...artPieces
          .filter((a) => (a.status || "available") === "available")
          .sort((a, b) => {
            // Sort by year descending (most recent first)
            // If year is null, use created_at as fallback
            const yearA = a.year || new Date(a.created_at).getFullYear();
            const yearB = b.year || new Date(b.created_at).getFullYear();
            return yearB - yearA;
          }),
        ...artPieces
          .filter((a) => a.status === "commission")
          .sort((a, b) => {
            const yearA = a.year || new Date(a.created_at).getFullYear();
            const yearB = b.year || new Date(b.created_at).getFullYear();
            return yearB - yearA;
          }),
        ...artPieces
          .filter((a) => a.status === "sold")
          .sort((a, b) => {
            const yearA = a.year || new Date(a.created_at).getFullYear();
            const yearB = b.year || new Date(b.created_at).getFullYear();
            return yearB - yearA;
          }),
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
          title="Alchemical Art Pieces"
          description={
            "Explore a collection of unique, mystical alchemical artworks. Each piece is crafted with intention, blending ancient symbolism, modern technique, and a touch of the divine. Discover the story, details, and visual journey behind every creation."
          }
        />
        <AlchemyGallery artPieces={sorted} />
      </div>
    </main>
  );
}

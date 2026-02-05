import AlchemyHeader from "../alchemy/Header";
import AltarGallery from "./AltarGallery";
import { createServerSupabase } from "@/util/supabase/server";
import { getLocale } from "next-intl/server";
import { pickLocalizedText } from "@/lib/db-i18n";

// Revalidate every 60 seconds to ensure fresh content
export const revalidate = 60;

export default async function AltarPage() {
  const locale = await getLocale();
  const supabase = createServerSupabase();

  // Fetch section content
  const { data: sectionContent } = await supabase
    .from("fanaha_sections")
    .select("*")
    .eq("slug", "altar-artwork")
    .single();

  // Fetch altar artworks
  const { data: artworks, error } = await supabase
    .from("fanaha_altar_artworks")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  const localizedSection = sectionContent
    ? {
        ...sectionContent,
        title: pickLocalizedText(sectionContent, "title", locale),
        description: pickLocalizedText(sectionContent, "description", locale),
      }
    : null;

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
          title={localizedSection?.title || "Altar Artwork"}
          description={
            localizedSection?.description ||
            "Sacred altar pieces designed to elevate your spiritual space."
          }
        />
        <div className="w-full max-w-3xl px-4 sm:px-0 mt-6 sm:mt-8">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />
        </div>
        <AltarGallery artworks={artworks || []} />
      </div>
    </main>
  );
}

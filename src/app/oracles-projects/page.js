import AlchemyHeader from "../alchemy/Header";
import OraclesProjectsGallery from "./OraclesProjectsGallery";
import { createServerSupabase } from "@/util/supabase/server";

export default async function OraclesProjectsPage() {
  const supabase = createServerSupabase();

  // Fetch section content
  const { data: sectionContent } = await supabase
    .from("sections")
    .select("title, description")
    .eq("slug", "oracles-projects")
    .single();

  // Fetch oracles & projects
  const { data: items, error } = await supabase
    .from("oracles_projects")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

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
          title={sectionContent?.title || "Oracles & Projects"}
          description={
            sectionContent?.description ||
            "Mystical oracles and collaborative creative projects."
          }
        />
        <OraclesProjectsGallery items={items || []} />
      </div>
    </main>
  );
}

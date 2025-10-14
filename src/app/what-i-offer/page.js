import AlchemyHeader from "../alchemy/Header";
import OfferingsSection from "./OfferingsSection";
import { createServerSupabase } from "@/util/supabase/server";

export default async function WhatIOfferPage() {
  const supabase = createServerSupabase();

  // Fetch section content
  const { data: sectionContent } = await supabase
    .from("sections")
    .select("title, description")
    .eq("slug", "what-i-offer")
    .single();

  // Fetch offerings
  const { data: offerings, error } = await supabase
    .from("offerings")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

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
          title={sectionContent?.title || "What I Offer"}
          description={
            sectionContent?.description ||
            "Sacred offerings and creative services to support your journey."
          }
        />
        <OfferingsSection offerings={offerings || []} />
      </div>
    </main>
  );
}

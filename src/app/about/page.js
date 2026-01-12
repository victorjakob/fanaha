import AboutClient from "./AboutClient";
import { createServerSupabase } from "@/util/supabase/server";

export const metadata = {
  title: "About - Fanaha",
  description: "Learn more about Fanaha and the creative journey",
};

// Revalidate every 60 seconds to ensure fresh content
export const revalidate = 60;

export default async function AboutPage() {
  const supabase = createServerSupabase();

  // Fetch the about content
  const { data: content } = await supabase
    .from("fanaha_about_content")
    .select("*")
    .single();

  return <AboutClient content={content} />;
}

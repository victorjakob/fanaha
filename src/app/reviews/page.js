import ReviewsClient from "./ReviewsClient";
import { createServerSupabase } from "@/util/supabase/server";

export const metadata = {
  title: "Testimonials - Fanaha",
  description: "Read what clients and owners say about Fanaha's artwork",
};

// Revalidate every 60 seconds to ensure fresh content
export const revalidate = 60;

export default async function ReviewsPage() {
  const supabase = createServerSupabase();

  // Fetch reviews, ordered by display_order then created_at
  const { data: reviews, error } = await supabase
    .from("fanaha_reviews")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  return <ReviewsClient reviews={reviews || []} />;
}

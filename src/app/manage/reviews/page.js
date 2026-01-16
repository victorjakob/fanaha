import ReviewsManageClient from "./ReviewsManageClient";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

export default async function ReviewsManagePage() {
  const supabase = createServerSupabase();

  // Fetch all reviews
  const { data: reviews, error } = await supabase
    .from("fanaha_reviews")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
  }

  return <ReviewsManageClient initialReviews={reviews || []} />;
}

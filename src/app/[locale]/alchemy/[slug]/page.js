import { createServerSupabase } from "@/util/supabase/server";
import { pickLocalizedText } from "@/lib/db-i18n";
import { buildPageMetadata } from "@/lib/seo";
import { cldUrlEnhanced } from "@/lib/cloudinary";
export { default, revalidate } from "../../../alchemy/[slug]/page";

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const path = `/alchemy/${slug}`;
  try {
    const supabase = createServerSupabase();
    const { data: piece } = await supabase
      .from("fanaha_alchemy_pieces")
      .select("*")
      .eq("slug", slug)
      .single();

    const title = piece ? pickLocalizedText(piece, "name", locale) : undefined;
    const description = piece
      ? pickLocalizedText(piece, "description", locale)
      : undefined;

    let image;
    if (piece?.main_image_public_id) {
      try { image = cldUrlEnhanced({ publicId: piece.main_image_public_id, width: 1200, crop: "limit", format: "jpg" }); } catch { image = undefined; }
    }
    if (!image && typeof piece?.main_image === "string" && piece.main_image.startsWith("http")) image = piece.main_image;

    return buildPageMetadata({
      locale,
      title,
      description,
      path,
      image,
    });
  } catch (error) {
    return buildPageMetadata({ locale, path });
  }
}

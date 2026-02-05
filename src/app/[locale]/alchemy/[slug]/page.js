import { createServerSupabase } from "@/util/supabase/server";
import { pickLocalizedText } from "@/lib/db-i18n";
import { buildPageMetadata } from "@/lib/seo";
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

    return buildPageMetadata({
      locale,
      title,
      description,
      path,
    });
  } catch (error) {
    return buildPageMetadata({ locale, path });
  }
}

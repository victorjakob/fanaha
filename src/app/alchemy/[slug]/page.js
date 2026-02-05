import { notFound } from "next/navigation";
import { createServerSupabase } from "@/util/supabase/server";
import AlchemyArtPieceDetailClient from "./Client";
import { getLocale } from "next-intl/server";
import { pickLocalizedText } from "@/lib/db-i18n";
import { getSiteUrl } from "@/lib/seo";
import { cldUrlEnhanced, isCloudinaryId } from "@/lib/cloudinary";

// Revalidate every 60 seconds to ensure fresh content
export const revalidate = 60;

export default async function AlchemyArtPieceDetail({ params }) {
  const { slug } = await params;
  const locale = await getLocale();
  const supabase = createServerSupabase();

  // Fetch by slug
  const { data: piece, error } = await supabase
    .from("fanaha_alchemy_pieces")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!piece || error) {
    return notFound();
  }

  const localizedPiece = {
    ...piece,
    name: pickLocalizedText(piece, "name", locale),
    description: pickLocalizedText(piece, "description", locale),
    dimensions: pickLocalizedText(piece, "dimensions", locale),
  };

  const mainImage =
    localizedPiece.main_image ||
    (localizedPiece.images && localizedPiece.images[0]);
  const siteUrl = getSiteUrl();
  const pieceUrl = `${siteUrl}/${locale}/alchemy/${slug}`;
  const schemaImageUrl = mainImage
    ? isCloudinaryId(mainImage)
      ? cldUrlEnhanced({
          publicId: mainImage,
          width: 1200,
          height: 1200,
          quality: "auto:best",
          crop: "fill",
          aspectRatio: "1:1",
        })
      : mainImage
    : null;
  const artworkSchema = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: localizedPiece.name,
    description: localizedPiece.description,
    url: pieceUrl,
    image: schemaImageUrl ? [schemaImageUrl] : undefined,
    creator: {
      "@type": "Person",
      name: "Fanaha",
    },
  };

  if (!schemaImageUrl) {
    delete artworkSchema.image;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(artworkSchema) }}
      />
      <AlchemyArtPieceDetailClient piece={localizedPiece} />
    </>
  );
}

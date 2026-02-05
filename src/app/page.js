import HomeClient from "./components/HomeClient";
import { getSlides } from "@/lib/slides";
import { getLocale } from "next-intl/server";
import { getDefaultOgImageUrl, getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const locale = await getLocale();
  const { desktop, mobile } = await getSlides(locale);
  const siteUrl = getSiteUrl();
  const localizedUrl = `${siteUrl}/${locale}`;
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Fanaha",
    url: localizedUrl,
    image: getDefaultOgImageUrl(),
    sameAs: [
      "https://www.instagram.com/fanaha",
      "https://www.facebook.com/fanahacrea",
    ],
    jobTitle: "Visual Artist",
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD for brand visibility in search results
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <HomeClient desktopSlides={desktop} mobileSlides={mobile} />
    </>
  );
}

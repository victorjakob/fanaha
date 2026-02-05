import { buildPageMetadata, getPageSeo } from "@/lib/seo";
export { default, revalidate } from "../../what-i-offer/page";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const path = "/what-i-offer";
  const { title, description } = getPageSeo("whatIOffer", locale);
  return buildPageMetadata({ locale, title, description, path });
}

import { buildPageMetadata, getPageSeo } from "@/lib/seo";
export { default, revalidate } from "../../reviews/page";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const path = "/reviews";
  const { title, description } = getPageSeo("reviews", locale);
  return buildPageMetadata({ locale, title, description, path });
}

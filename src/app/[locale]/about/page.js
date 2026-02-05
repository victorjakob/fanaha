import { buildPageMetadata, getPageSeo } from "@/lib/seo";
export { default, revalidate } from "../../about/page";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const path = "/about";
  const { title, description } = getPageSeo("about", locale);
  return buildPageMetadata({ locale, title, description, path });
}

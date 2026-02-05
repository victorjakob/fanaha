import { buildPageMetadata, getPageSeo } from "@/lib/seo";
export { default, revalidate } from "../../altar/page";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const path = "/altar";
  const { title, description } = getPageSeo("altar", locale);
  return buildPageMetadata({ locale, title, description, path });
}

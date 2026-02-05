import { buildPageMetadata, getPageSeo } from "@/lib/seo";
export { default, revalidate } from "../../murals/page";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const path = "/murals";
  const { title, description } = getPageSeo("murals", locale);
  return buildPageMetadata({ locale, title, description, path });
}

import { buildPageMetadata, getPageSeo } from "@/lib/seo";
export { default } from "../../order/page";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const path = "/order";
  const { title, description } = getPageSeo("order", locale);
  return buildPageMetadata({ locale, title, description, path });
}

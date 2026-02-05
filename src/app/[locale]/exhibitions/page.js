import { buildPageMetadata, getPageSeo } from "@/lib/seo";
export { default, revalidate } from "../../exhibitions/page";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const path = "/exhibitions";
  const { title, description } = getPageSeo("exhibitions", locale);
  return buildPageMetadata({ locale, title, description, path });
}

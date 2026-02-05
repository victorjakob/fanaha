import { buildPageMetadata, getPageSeo } from "@/lib/seo";
export { default, revalidate } from "../../alchemy/page";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const path = "/alchemy";
  const { title, description } = getPageSeo("alchemy", locale);
  return buildPageMetadata({ locale, title, description, path });
}

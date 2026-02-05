import { buildPageMetadata, getPageSeo } from "@/lib/seo";
export { default, revalidate } from "../../oracles-projects/page";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const path = "/oracles-projects";
  const { title, description } = getPageSeo("oraclesProjects", locale);
  return buildPageMetadata({ locale, title, description, path });
}

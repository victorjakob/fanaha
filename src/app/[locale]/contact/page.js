import { buildPageMetadata, getPageSeo } from "@/lib/seo";
export { default } from "../../contact/page";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const path = "/contact";
  const { title, description } = getPageSeo("contact", locale);
  return buildPageMetadata({ locale, title, description, path });
}

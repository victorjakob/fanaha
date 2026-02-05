import { buildPageMetadata, getPageSeo } from "@/lib/seo";
export { default, dynamic } from "../page";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const { description } = getPageSeo("home", locale);
  return {
    ...buildPageMetadata({
      locale,
      description,
      path: "",
    }),
  };
}

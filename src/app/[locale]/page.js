import { buildPageMetadata, getPageSeo } from "@/lib/seo";
export { default, dynamic } from "../page";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const { description } = getPageSeo("home", locale);
  const title = locale === "fr"
    ? "Fanaha — Artiste visuelle, pièces d’alchimie et fresques"
    : "Fanaha — Visual Artist, Alchemical Art & Murals";
  const base = buildPageMetadata({ locale, description, path: "" });
  return {
    ...base,
    // Absolute: skip the "%s | Fanaha" template so the name isn't repeated.
    title: { absolute: title },
    openGraph: { ...base.openGraph, title },
    twitter: { ...base.twitter, title },
  };
}

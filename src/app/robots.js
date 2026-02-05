import { getSiteUrl } from "@/lib/seo";

export default function robots() {
  const siteUrl = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/manage", "/alchemy/create", "/alchemy/*/edit"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

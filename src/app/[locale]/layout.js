import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import MenuShell from "../components/MenuShell";
import ConditionalFooter from "../components/ConditionalFooter";
import HtmlLangSetter from "../components/HtmlLangSetter";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  getMetadataBase,
  getOpenGraphImages,
  getTwitterImages,
} from "@/lib/seo";

const locales = ["en", "fr"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const localePath = `/${locale}`;

  return {
    metadataBase: getMetadataBase(),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    alternates: {
      canonical: localePath,
      languages: {
        en: "/en",
        fr: "/fr",
      },
    },
    openGraph: {
      siteName: SITE_NAME,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      type: "website",
      images: getOpenGraphImages(),
    },
    twitter: {
      card: "summary_large_image",
      images: getTwitterImages(),
    },
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  // Ensure next-intl resolves the locale for Server Components.
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlLangSetter />
      <MenuShell />
      {children}
      <ConditionalFooter />
    </NextIntlClientProvider>
  );
}

import { Playfair_Display, Nunito } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  getMetadataBase,
  getOpenGraphImages,
  getTwitterImages,
} from "@/lib/seo";

const houseMinimalist = localFont({
  src: "./fonts/House Minimalist.otf",
  variable: "--font-house-minimalist",
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    images: getOpenGraphImages(),
  },
  twitter: {
    card: "summary_large_image",
    images: getTwitterImages(),
  },
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body
        suppressHydrationWarning
        className={`${nunito.variable} ${playfair.variable} ${houseMinimalist.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

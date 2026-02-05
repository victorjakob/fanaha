import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware({
  ...routing,
  // Keep deterministic routing; we handle first-visit geo choice ourselves.
  localeDetection: false,
});

const LOCALE_COOKIE = "NEXT_LOCALE";
const SOFT_LAUNCH_COOKIE = "soft_launch_bypass";

function detectCountry(request) {
  // On Vercel/Edge, NextRequest may provide request.geo.country.
  const geoCountry = request.geo?.country;
  if (geoCountry) return String(geoCountry).toUpperCase();

  // Common provider headers (best-effort).
  const headerCandidates = [
    "x-vercel-ip-country",
    "x-vercel-country",
    "cf-ipcountry",
    "x-country-code",
  ];
  for (const name of headerCandidates) {
    const value = request.headers.get(name);
    if (value) return String(value).toUpperCase();
  }
  return null;
}

function getLocaleFromPathname(pathname) {
  const seg = pathname.split("/")[1];
  return seg === "fr" || seg === "en" ? seg : null;
}

export default function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Soft launch gate (public sees Coming Soon; you can bypass with a cookie)
  if (process.env.SOFT_LAUNCH_ENABLED === "true") {
    const isBypassed = request.cookies.get(SOFT_LAUNCH_COOKIE)?.value === "1";
    const isComingSoon = pathname.includes("/coming-soon");
    const isUnlockPath = pathname === "/love";
    const isAdmin =
      pathname.startsWith("/manage") ||
      pathname.startsWith("/alchemy/create") ||
      /^\/alchemy\/[^/]+\/edit/.test(pathname);

    if (!isBypassed && !isAdmin && !isComingSoon && !isUnlockPath) {
      const locale =
        getLocaleFromPathname(pathname) ||
        request.cookies.get(LOCALE_COOKIE)?.value ||
        "en";

      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/coming-soon`;
      return NextResponse.redirect(url);
    }
  }

  // Geo-based default only on the first visit to `/` (no locale cookie yet).
  if (pathname === "/") {
    const existingLocale = request.cookies.get(LOCALE_COOKIE)?.value;
    if (!existingLocale) {
      const country = detectCountry(request);
      const preferredLocale = country === "FR" ? "fr" : "en";

      const url = request.nextUrl.clone();
      url.pathname = `/${preferredLocale}`;

      const response = NextResponse.redirect(url);
      response.cookies.set(LOCALE_COOKIE, preferredLocale, {
        path: "/",
        sameSite: "lax",
      });
      return response;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Exclude:
  // - Next.js internals
  // - Static files
  // - API routes
  // - Admin area (/manage) which you want unprefixed
  // - Admin-only alchemy pages (create + edit) which you want unprefixed
  matcher: [
    "/((?!api|manage|alchemy/create|alchemy/[^/]+/edit|_next|.*\\..*).*)",
  ],
};

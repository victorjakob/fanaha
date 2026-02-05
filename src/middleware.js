import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware({
  ...routing,
  // Keep deterministic routing; we handle first-visit geo choice ourselves.
  localeDetection: false,
});

const LOCALE_COOKIE = "NEXT_LOCALE";

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

export default function middleware(request) {
  // Geo-based default only on the first visit to `/` (no locale cookie yet).
  if (request.nextUrl.pathname === "/") {
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

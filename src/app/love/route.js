import { NextResponse } from "next/server";

function detectCountry(request) {
  const geoCountry = request.geo?.country;
  if (geoCountry) return String(geoCountry).toUpperCase();

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

export async function GET(request) {
  const url = new URL(request.url);

  // Unlock soft-launch on this device
  const res = NextResponse.redirect(new URL("/", url.origin));
  res.cookies.set("soft_launch_bypass", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Also set a locale cookie if none exists yet (nice UX)
  const existingLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (!existingLocale) {
    const country = detectCountry(request);
    const preferredLocale = country === "FR" ? "fr" : "en";
    res.cookies.set("NEXT_LOCALE", preferredLocale, {
      path: "/",
      sameSite: "lax",
    });
  }

  return res;
}

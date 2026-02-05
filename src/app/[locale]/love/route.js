import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { locale } = await params;
  const url = new URL(request.url);

  const nextLocale = locale === "fr" ? "fr" : "en";
  const res = NextResponse.redirect(new URL(`/${nextLocale}`, url.origin));

  res.cookies.set("soft_launch_bypass", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  res.cookies.set("NEXT_LOCALE", nextLocale, {
    path: "/",
    sameSite: "lax",
  });

  return res;
}

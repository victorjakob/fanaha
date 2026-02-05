import { NextResponse } from "next/server";

export async function GET(request) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirect") || "/en";

  const res = NextResponse.redirect(new URL(redirectTo, url.origin));
  res.cookies.set("soft_launch_bypass", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

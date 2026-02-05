import { NextResponse } from "next/server";

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const redirectTo = url.searchParams.get("redirect") || "/en";

  const expected = process.env.SOFT_LAUNCH_TOKEN || "";
  if (!expected || token !== expected) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const res = NextResponse.redirect(new URL(redirectTo, url.origin));
  res.cookies.set("soft_launch_bypass", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

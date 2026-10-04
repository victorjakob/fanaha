import { NextResponse } from "next/server";
import { checkPassword, clearAdminCookie, isAdmin, setAdminCookie } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Is this browser signed in to the manage area? */
export async function GET(request) {
  return NextResponse.json({ authenticated: isAdmin(request) });
}

/** Sign in with the manage password. */
export async function POST(request) {
  const { password } = await request.json().catch(() => ({}));
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }
  return setAdminCookie(NextResponse.json({ authenticated: true }));
}

/** Sign out. */
export async function DELETE() {
  return clearAdminCookie(NextResponse.json({ authenticated: false }));
}

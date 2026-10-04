import crypto from "crypto";

/**
 * Server-only admin login for /manage and the alchemy create/edit pages.
 * The password never reaches the browser; a signed, httpOnly cookie marks the session.
 */
export const ADMIN_COOKIE = "fanaha_admin";
const MAX_AGE = 60 * 60 * 24 * 365; // one year, like the old cookie

function password() {
  return process.env.MANAGE_PASSWORD || "love";
}

function signingKey() {
  const key = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("No signing key configured for admin sessions");
  return key;
}

function token() {
  return crypto.createHmac("sha256", signingKey()).update(`fanaha-admin:v1:${password()}`).digest("hex");
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function checkPassword(input) {
  return typeof input === "string" && safeEqual(input, password());
}

function readCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

export function isAdmin(request) {
  const value = readCookie(request, ADMIN_COOKIE);
  return !!value && safeEqual(value, token());
}

export function setAdminCookie(response) {
  response.cookies.set(ADMIN_COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return response;
}

export function clearAdminCookie(response) {
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}

/** Use at the top of admin-only route handlers: `const denied = requireAdmin(req); if (denied) return denied;` */
export function requireAdmin(request) {
  if (isAdmin(request)) return null;
  return Response.json({ error: "Not signed in. Reload the manage page and enter the password." }, { status: 401 });
}

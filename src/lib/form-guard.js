/** Shared checks for the public contact and order forms. */

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** A hidden "website" field people never see; bots fill it in. */
export function isBot(body) {
  return typeof body?.website === "string" && body.website.trim() !== "";
}

export function clean(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

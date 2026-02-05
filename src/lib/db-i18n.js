export const NEEDS_TRANSLATION = "[NEEDS_TRANSLATION]";

function isBlank(value) {
  return value == null || (typeof value === "string" && value.trim() === "");
}

export function isNeedsTranslation(value) {
  return (
    value === NEEDS_TRANSLATION ||
    (typeof value === "string" && value.trim() === NEEDS_TRANSLATION)
  );
}

function isMissingJson(value) {
  if (value == null) return true;
  if (Array.isArray(value)) {
    if (value.length === 0) return true;
    if (value.length === 1 && isNeedsTranslation(value[0])) return true;
    return false;
  }
  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }
  if (typeof value === "string") {
    return isBlank(value) || isNeedsTranslation(value);
  }
  return false;
}

/**
 * Pick a localized string field from a Supabase row with a *_fr column convention.
 * Falls back to English when the French value is missing or marked as NEEDS_TRANSLATION.
 */
export function pickLocalizedText(row, field, locale) {
  if (!row) return "";
  if (locale === "fr") {
    const frValue = row[`${field}_fr`];
    if (!isBlank(frValue) && !isNeedsTranslation(frValue)) return frValue;
  }
  return row[field] ?? "";
}

/**
 * Pick a localized JSON field from a Supabase row with a *_fr column convention.
 * Designed for jsonb arrays/objects (e.g. about page structured content).
 */
export function pickLocalizedJson(row, field, locale) {
  if (!row) return null;
  if (locale === "fr") {
    const frValue = row[`${field}_fr`];
    if (!isMissingJson(frValue)) return frValue;
  }
  return row[field] ?? null;
}

/**
 * If a French value is not provided in the admin UI, store a marker so the owner
 * can see it needs translation later.
 */
export function coerceFrenchText(value) {
  return isBlank(value) ? NEEDS_TRANSLATION : value;
}

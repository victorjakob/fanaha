/**
 * Derive default "See More" and "Get Yours" URLs from offering title.
 * Used to auto-populate DB and as fallback when values are missing.
 */
export function getDefaultLinks(title) {
  const titleLower = (title || "").toLowerCase();

  if (
    titleLower.includes("alchemical art") ||
    titleLower.includes("commission")
  ) {
    return { seeMore: "/alchemy", getYours: "/order" };
  }
  if (titleLower.includes("altar")) {
    return { seeMore: "/altar", getYours: "/order" };
  }
  if (titleLower.includes("mural")) {
    return { seeMore: "/murals", getYours: "/order" };
  }
  if (titleLower.includes("oracle") || titleLower.includes("project")) {
    return { seeMore: "/oracles-projects", getYours: "/order" };
  }
  if (
    titleLower.includes("grand scale") ||
    titleLower.includes("grandscale") ||
    titleLower.includes("personal creation")
  ) {
    return { seeMore: null, getYours: "/order" };
  }

  return { seeMore: "/contact", getYours: "/order" };
}

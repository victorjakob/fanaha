/**
 * Formats a price value to ISK currency format
 * @param {number|string} price - The price value
 * @returns {string} Formatted price string (e.g., "400.000 ISK")
 */
export function formatISK(price) {
  if (!price && price !== 0) return "";

  // Convert to number and handle invalid values
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "";

  // Format with thousand separators using dots (Icelandic format)
  // Use explicit formatting to avoid hydration issues
  const formatted = numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formatted} ISK`;
}

/**
 * Formats a price value to ISK currency format without the "kr" suffix
 * @param {number|string} price - The price value
 * @returns {string} Formatted price string (e.g., "400.000")
 */
export function formatISKNumber(price) {
  if (!price && price !== 0) return "";

  // Convert to number and handle invalid values
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "";

  // Format with thousand separators using dots (Icelandic format)
  // Use explicit formatting to avoid hydration issues
  return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

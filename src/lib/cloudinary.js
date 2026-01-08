// Cloudinary URL builder with optimized transforms for homepage slides
export function cldUrl({ publicId, isMobile = false, w, h }) {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dy8q4hf0k";

  // Determine aspect ratio based on viewport
  // Desktop: 16:9, Mobile: 4:5
  const ar = isMobile ? "ar_4:5" : "ar_16:9";

  // Use provided dimensions or defaults
  const width = w || (isMobile ? 640 : 1920);
  const height = h || (isMobile ? 800 : 1080);

  // Transform order: c_fill,g_center,ar_X:Y,f_auto,q_auto:best,dpr_auto,w_X,h_Y
  // Using auto:best for homepage hero images for premium quality
  const transforms = [
    "c_fill",
    "g_center",
    ar,
    "f_auto",
    "q_auto:best",
    "dpr_auto",
    `w_${width}`,
    `h_${height}`,
  ].join(",");

  // Add fanaha/bg/ prefix to publicId for homepage slides
  const fullPublicId = publicId.startsWith("fanaha/bg/")
    ? publicId
    : `fanaha/bg/${publicId}`;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${fullPublicId}`;
}

/**
 * Enhanced Cloudinary URL builder with full control
 * @param {object} params - URL parameters
 * @param {string} params.publicId - Cloudinary public_id
 * @param {number} params.width - Image width
 * @param {number} params.height - Image height
 * @param {string} params.quality - Quality setting (default: 'auto:good')
 * @param {string} params.format - Format (default: 'auto')
 * @param {string} params.crop - Crop mode (default: 'fill')
 * @param {string} params.gravity - Gravity/position (default: 'center')
 * @param {string} params.aspectRatio - Aspect ratio (e.g., '1:1', '16:9')
 * @returns {string} - Optimized Cloudinary URL
 */
export function cldUrlEnhanced({
  publicId,
  width,
  height,
  quality = "auto:good",
  format = "auto",
  crop = "fill",
  gravity = "center",
  aspectRatio,
}) {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dy8q4hf0k";

  const transforms = [
    `c_${crop}`,
    `g_${gravity}`,
    aspectRatio ? `ar_${aspectRatio}` : null,
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
    `q_${quality}`,
    `f_${format}`,
    "dpr_auto",
  ]
    .filter(Boolean)
    .join(",");

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
}

// Helper for thumbnail generation (admin panel)
export function cldThumbnail({ publicId }) {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dy8q4hf0k";

  const transforms = [
    "c_fill",
    "g_center",
    "ar_16:9",
    "w_400",
    "h_225",
    "f_auto",
    "q_auto",
  ].join(",");

  const fullPublicId = publicId.startsWith("fanaha/bg/")
    ? publicId
    : `fanaha/bg/${publicId}`;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${fullPublicId}`;
}

/**
 * Generate blur placeholder URL (low quality, small size)
 * @param {string} publicId - Cloudinary public_id
 * @returns {string} - Blur placeholder URL
 */
export function cldBlurUrl(publicId) {
  return cldUrlEnhanced({
    publicId,
    width: 20,
    height: 20,
    quality: "auto:low",
    format: "auto",
  });
}

/**
 * Generate responsive srcset for different sizes
 * @param {string} publicId - Cloudinary public_id
 * @param {number[]} sizes - Array of widths (e.g., [320, 640, 1280])
 * @returns {string} - Srcset string
 */
export function cldResponsiveSrcset(publicId, sizes) {
  return sizes
    .map((size) => {
      const url = cldUrlEnhanced({ publicId, width: size, height: size });
      return `${url} ${size}w`;
    })
    .join(", ");
}

/**
 * Detect if image URL is a Cloudinary public_id or external URL
 * @param {string} imageUrl - Image URL or public_id
 * @returns {boolean} - True if Cloudinary public_id, false if external URL
 */
export function isCloudinaryId(imageUrl) {
  if (!imageUrl) return false;
  // Cloudinary public_ids don't contain http:// or https://
  // Supabase URLs contain supabase.co
  // Full URLs contain http or https
  return (
    !imageUrl.includes("http") &&
    !imageUrl.includes("https") &&
    !imageUrl.includes("supabase.co")
  );
}

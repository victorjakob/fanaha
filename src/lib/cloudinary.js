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

  // Transform order: c_fill,g_center,ar_X:Y,f_auto,q_auto:good,dpr_auto,w_X,h_Y
  const transforms = [
    "c_fill",
    "g_center",
    ar,
    "f_auto",
    "q_auto:good",
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

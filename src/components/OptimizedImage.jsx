"use client";

/**
 * OptimizedImage Component
 * 
 * A wrapper around Next.js Image component that:
 * - Handles both Cloudinary public_ids and Supabase URLs (backward compatible)
 * - Automatically generates blur placeholders for Cloudinary images
 * - Applies proper responsive sizing
 * - Optimizes image delivery
 */

import Image from "next/image";
import { cldUrlEnhanced, cldBlurUrl, isCloudinaryId } from "@/lib/cloudinary";

export function OptimizedImage({
  publicId,
  alt,
  width,
  height,
  priority = false,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  crop = "fill",
  quality = "auto:good",
  aspectRatio,
  // Allow passing full URL for backward compatibility
  src,
}) {
  // Use src prop if provided (for direct URLs), otherwise use publicId
  const imageSource = src || publicId;

  if (!imageSource) {
    return null;
  }

  // Detect if it's a Cloudinary public_id or external URL (Supabase)
  const isCloudinary = isCloudinaryId(imageSource);

  // Generate optimized URL
  const optimizedSrc = isCloudinary
    ? cldUrlEnhanced({
        publicId: imageSource,
        width,
        height,
        quality,
        crop,
        aspectRatio,
      })
    : imageSource; // Use Supabase URL as-is for backward compatibility

  // Generate blur placeholder (only for Cloudinary images)
  const blurSrc = isCloudinary ? cldBlurUrl(imageSource) : undefined;

  return (
    <Image
      src={optimizedSrc}
      alt={alt || ""}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
      placeholder={blurSrc ? "blur" : "empty"}
      blurDataURL={blurSrc}
      quality={90}
    />
  );
}

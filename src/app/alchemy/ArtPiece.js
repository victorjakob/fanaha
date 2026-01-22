"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cldUrlEnhanced, isCloudinaryId } from "@/lib/cloudinary";

export default function AlchemyArtPiece({
  slug,
  title,
  mainImage,
  status,
  dimensions,
  palette,
  index,
}) {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);
  const containerRef = useRef(null);
  const hasPreloadedRef = useRef(false);

  // Preload the detail page image on hover/touch/visibility for faster navigation
  const preloadDetailImage = () => {
    // Only preload once per component instance
    if (hasPreloadedRef.current) return;
    // Ensure we're on the client side
    if (typeof window === "undefined" || typeof document === "undefined")
      return;
    if (!mainImage) return;

    hasPreloadedRef.current = true;

    // Prefetch the route (Next.js will prefetch the page)
    router.prefetch(`/alchemy/${slug}`);

    // Preload the larger image that will be used on the detail page
    if (isCloudinaryId(mainImage)) {
      const detailImageUrl = cldUrlEnhanced({
        publicId: mainImage,
        width: 1000,
        height: 1000,
        quality: "auto:best",
        crop: "fill",
        aspectRatio: "1:1",
      });

      // Check if already preloaded to avoid duplicates
      try {
        const existingLink = document.querySelector(
          `link[href="${detailImageUrl}"]`
        );
        if (!existingLink) {
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "image";
          link.href = detailImageUrl;
          document.head.appendChild(link);
        }
      } catch (error) {
        // Silently fail if document manipulation fails
        console.warn("Failed to preload image:", error);
      }
    }
  };

  // Use Intersection Observer for mobile - preload when item comes into view
  useEffect(() => {
    // Only run on client side to avoid hydration issues
    if (typeof window === "undefined" || typeof document === "undefined")
      return;
    if (!containerRef.current) return;

    if (!("IntersectionObserver" in window)) {
      // Fallback: preload immediately if IntersectionObserver not supported
      preloadDetailImage();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            preloadDetailImage();
            // Once preloaded, we can unobserve to save resources
            if (entry.target) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        // Start preloading when item is 200px away from viewport
        rootMargin: "200px",
        threshold: 0,
      }
    );

    const currentElement = containerRef.current;
    observer.observe(currentElement);

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    setIsClicked(true);
    router.push(`/alchemy/${slug}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      setIsClicked(true);
      router.push(`/alchemy/${slug}`);
    }
  };

  // Create a background gradient from the palette
  let bgGradient = undefined;
  if (palette && palette.length > 1) {
    bgGradient = `radial-gradient(circle at 60% 40%, ${palette
      .map((color, i) => `${color} ${(i * 100) / (palette.length - 1)}%`)
      .join(", ")})`;
  } else if (palette && palette.length === 1) {
    bgGradient = palette[0];
  }

  return (
    <motion.div
      ref={containerRef}
      className="relative flex flex-col items-center w-full px-4 sm:px-8 cursor-pointer outline-none group"
      whileHover="hover"
      whileFocus="hover"
      whileTap={{ scale: 0.95 }}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={preloadDetailImage}
      onTouchStart={preloadDetailImage}
      onFocus={preloadDetailImage}
      aria-label={title}
      style={{ minHeight: 320 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      animate={{
        opacity: isClicked ? 0.5 : 1,
        scale: isClicked ? 0.95 : 1,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Epic animated glow background */}
      {palette && palette.length > 0 && (
        <>
          {/* Primary epic glow */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${palette[0]}30 0%, transparent 65%)`,
              filter: "blur(16px)",
              zIndex: -1,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Secondary epic glow */}
          {palette[1] && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${palette[1]}24 0%, transparent 75%)`,
                filter: "blur(24px)",
                zIndex: -2,
              }}
              animate={{
                scale: [1.15, 1.35, 1.15],
                opacity: [0.2, 0.45, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          )}

          {/* Tertiary epic glow */}
          {palette[2] && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${palette[2]}20 0%, transparent 85%)`,
                filter: "blur(32px)",
                zIndex: -3,
              }}
              animate={{
                scale: [1.3, 1.5, 1.3],
                opacity: [0.15, 0.4, 0.15],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          )}

          {/* Dreamy palette background (original) */}
          {bgGradient && (
            <div
              className="absolute inset-0 z-0 rounded-full blur-2xl opacity-40 pointer-events-none"
              style={{
                background: bgGradient,
                filter: "blur(32px)",
                zIndex: 0,
              }}
            />
          )}
        </>
      )}
      <motion.div
        className="relative flex items-center justify-center aspect-square rounded-full overflow-hidden transition-all duration-700 w-[80vw] sm:max-w-lg md:max-w-md lg:max-w-[420px] xl:max-w-[420px] 2xl:max-w-[420px] group-hover:shadow-lg group-hover:shadow-black/20"
        initial={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        style={{
          filter:
            palette && palette.length > 0
              ? `
            drop-shadow(0 0 10px ${palette[0]}35)
            drop-shadow(0 0 20px ${palette[0]}22)
            ${palette[1] ? `drop-shadow(0 0 32px ${palette[1]}14)` : ""}
            ${palette[2] ? `drop-shadow(0 0 44px ${palette[2]}10)` : ""}
          `
              : "drop-shadow(0 0 14px rgba(0,0,0,0.28)) drop-shadow(0 0 28px rgba(0,0,0,0.18))",
        }}
      >
        <OptimizedImage
          publicId={mainImage}
          alt={title}
          width={2000}
          height={2000}
          sizes="(max-width: 640px) 80vw, (max-width: 768px) 512px, 448px"
          className="object-cover w-full h-full select-none transition-transform duration-300 group-hover:scale-105 rounded-full"
          priority={index !== undefined && index < 3}
          aspectRatio="1:1"
          crop="fill"
          quality="auto:best"
        />
        {/* Black overlay on hover */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          initial={{ opacity: 0 }}
          variants={{ hover: { opacity: 1 } }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
        >
          <span
            className="text-white font-light tracking-wider mb-1 sm:mb-2 drop-shadow-lg text-center px-3 sm:px-4 whitespace-nowrap overflow-hidden"
            style={{
              fontSize: "clamp(1.125rem, 4.5vw, 2.5rem)",
              lineHeight: "1.2",
              display: "block",
              maxWidth: "95%",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </span>
          {dimensions && (
            <span
              className="text-white/70 text-sm sm:text-base md:text-lg leading-loose tracking-wide text-center px-3 sm:px-4 mt-0.5 sm:mt-1"
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontWeight: 200,
              }}
            >
              {dimensions}
            </span>
          )}
        </motion.div>

        {/* Loading overlay when clicked */}
        {isClicked && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/80 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <span className="text-white text-sm font-light tracking-wide">
                Loading...
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Mobile Info Display - shown below image on small screens */}
      <div className="sm:hidden mt-4 text-center space-y-1">
        <h3 className="text-lg font-medium text-black tracking-wide">
          {title}
        </h3>
        {dimensions && (
          <p
            className="text-sm text-black/70 tracking-wide"
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontWeight: 300,
            }}
          >
            {dimensions}
          </p>
        )}
      </div>
    </motion.div>
  );
}

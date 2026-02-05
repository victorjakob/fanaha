"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";
import { isCloudinaryId } from "@/lib/cloudinary";

export default function AlchemyArtPieceGallery({ images, name }) {
  // Hooks must be called before any early returns
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [[page, direction], setPage] = useState([0, 0]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Early return check - but must be after all hooks
  const shouldRender = images && images.length >= 2;
  const galleryImages = useMemo(
    () => (shouldRender ? images.slice(1) : []),
    [images, shouldRender]
  );

  const openLightbox = (idx) => {
    setLightboxIdx(idx);
    setPage([idx, 0]);
  };

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);

  const paginate = useCallback(
    (newDirection) => {
      const newIndex = lightboxIdx + newDirection;
      if (newIndex < 0) {
        setLightboxIdx(galleryImages.length - 1);
        setPage([galleryImages.length - 1, newDirection]);
      } else if (newIndex >= galleryImages.length) {
        setLightboxIdx(0);
        setPage([0, newDirection]);
      } else {
        setLightboxIdx(newIndex);
        setPage([newIndex, newDirection]);
      }
    },
    [galleryImages.length, lightboxIdx]
  );

  const prevImage = useCallback(() => paginate(-1), [paginate]);
  const nextImage = useCallback(() => paginate(1), [paginate]);

  // Preload adjacent images for faster navigation
  useEffect(() => {
    if (lightboxIdx === null || galleryImages.length === 0) return;
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    const preloadImage = (publicId) => {
      if (!publicId) return;

      let imageUrl;
      if (isCloudinaryId(publicId)) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        if (!cloudName) return;
        // Preload full-size image for lightbox (600px max display, but request larger for quality)
        imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto:best,f_auto,w_1200/${publicId}`;
      } else {
        imageUrl = publicId;
      }

      // Check if already preloaded
      const existingLink = document.querySelector(
        `link[href="${imageUrl}"][data-preload="lightbox"]`
      );
      if (existingLink) return;

      // Preload using link element
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = imageUrl;
      link.setAttribute("data-preload", "lightbox");
      document.head.appendChild(link);

      // Also preload using Image object as fallback for better browser support
      const img = new Image();
      img.src = imageUrl;
    };

    // Preload current image at higher quality
    if (galleryImages[lightboxIdx]) {
      preloadImage(galleryImages[lightboxIdx]);
    }

    // Preload next image
    const nextIdx = (lightboxIdx + 1) % galleryImages.length;
    if (galleryImages[nextIdx] && nextIdx !== lightboxIdx) {
      preloadImage(galleryImages[nextIdx]);
    }

    // Preload previous image
    const prevIdx =
      lightboxIdx === 0 ? galleryImages.length - 1 : lightboxIdx - 1;
    if (galleryImages[prevIdx] && prevIdx !== lightboxIdx) {
      preloadImage(galleryImages[prevIdx]);
    }
  }, [lightboxIdx, galleryImages]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIdx === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIdx, prevImage, nextImage, closeLightbox]);

  if (!shouldRender) return null;

  return (
    <motion.section
      className="w-full max-w-xl flex flex-col items-center gap-4 mb-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
    >
      {/* Gallery Thumbnails */}
      <div className="flex flex-wrap gap-3 sm:gap-4 justify-center w-full max-w-2xl">
        {galleryImages.map((img, i) => (
          <motion.button
            key={img}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.1 + i * 0.08,
              ease: "easeOut",
            }}
            className="rounded-xl overflow-hidden shadow-lg flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-400"
            style={{
              width: "38vw",
              maxWidth: 140,
              height: "38vw",
              maxHeight: 140,
              cursor: "pointer",
              backgroundColor: "transparent",
            }}
            onClick={() => openLightbox(i)}
            tabIndex={0}
            aria-label={`View image ${i + 1}`}
          >
            <OptimizedImage
              publicId={img}
              alt={`${name} detail ${i + 1}`}
              width={280}
              height={280}
              sizes="(max-width: 640px) 38vw, 280px"
              className="object-cover rounded-xl"
              style={{ width: "100%", height: "100%" }}
              crop="fill"
              quality="auto:best"
            />
          </motion.button>
        ))}
      </div>
      {/* Lightbox Modal - portaled to body so it appears above TopBar */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {lightboxIdx !== null && (
              <motion.div
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeLightbox}
              >
                {/* Close button */}
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 bg-zinc-900/80 text-white hover:bg-red-600 rounded-full p-3 shadow-lg z-10 transition-colors"
                  aria-label="Close carousel"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Navigation arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-zinc-900/70 text-white hover:bg-zinc-800 rounded-full p-3 shadow-lg z-10 transition-colors hidden sm:flex items-center justify-center"
                      aria-label="Previous image"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-900/70 text-white hover:bg-zinc-800 rounded-full p-3 shadow-lg z-10 transition-colors hidden sm:flex items-center justify-center"
                      aria-label="Next image"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}

                {/* Carousel image with swipe */}
                <div className="relative w-full h-full flex items-center justify-center p-8">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={lightboxIdx}
                      custom={direction}
                      variants={{
                        enter: (direction) => ({
                          x: direction > 0 ? 1000 : -1000,
                          opacity: 0,
                          scale: 0.8,
                        }),
                        center: {
                          zIndex: 1,
                          x: 0,
                          opacity: 1,
                          scale: 1,
                        },
                        exit: (direction) => ({
                          zIndex: 0,
                          x: direction < 0 ? 1000 : -1000,
                          opacity: 0,
                          scale: 0.8,
                        }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                        scale: { duration: 0.2 },
                      }}
                      drag={galleryImages.length > 1 ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={1}
                      onDragEnd={(e, { offset, velocity }) => {
                        const swipe = Math.abs(offset.x) * velocity.x;
                        if (swipe > 10000) {
                          prevImage();
                        } else if (swipe < -10000) {
                          nextImage();
                        }
                      }}
                      className="absolute flex items-center justify-center"
                      style={{
                        maxWidth: "min(90vw, 600px)",
                        maxHeight: "min(90vh, 600px)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <OptimizedImage
                        publicId={galleryImages[lightboxIdx]}
                        alt={`${name} detail ${lightboxIdx + 1}`}
                        width={1600}
                        height={1600}
                        sizes="90vw"
                        className="rounded-xl shadow-2xl"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          backgroundColor: "transparent",
                        }}
                        quality="auto:best"
                        crop="fill"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Swipe indicator (mobile only) */}
                {galleryImages.length > 1 && (
                  <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                    Swipe to navigate
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </motion.section>
  );
}

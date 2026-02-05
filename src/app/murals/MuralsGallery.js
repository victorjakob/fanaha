"use client";

import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";
import { isCloudinaryId } from "@/lib/cloudinary";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function MuralsGallery({ murals }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const shouldRender = murals && murals.length > 0;

  const openLightbox = (images, index) => {
    setLightboxImages(images);
    setCurrentIndex(index);
    setPage([index, 0]);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setLightboxImages([]);
    setCurrentIndex(0);
  }, []);

  const paginate = useCallback(
    (newDirection) => {
      let newIndex = currentIndex + newDirection;
      if (newIndex < 0) {
        newIndex = lightboxImages.length - 1;
      } else if (newIndex >= lightboxImages.length) {
        newIndex = 0;
      }
      setCurrentIndex(newIndex);
      setPage([newIndex, newDirection]);
    },
    [currentIndex, lightboxImages.length]
  );

  const nextImage = useCallback(() => paginate(1), [paginate]);
  const prevImage = useCallback(() => paginate(-1), [paginate]);

  // Preload adjacent images (same URL as display for cache hit)
  useEffect(() => {
    if (!lightboxOpen || !lightboxImages || lightboxImages.length === 0) return;
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    const getImageUrl = (source) => {
      if (!source) return null;
      if (isCloudinaryId(source)) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        if (!cloudName) return null;
        return `https://res.cloudinary.com/${cloudName}/image/upload/q_auto:best,f_auto/${source}`;
      }
      return source;
    };

    const preloadImage = (source) => {
      const imageUrl = getImageUrl(source);
      if (!imageUrl) return;
      const existing = document.querySelector(
        `link[href="${imageUrl}"][data-preload="lightbox"]`
      );
      if (existing) return;
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = imageUrl;
      link.setAttribute("data-preload", "lightbox");
      document.head.appendChild(link);
      const img = new window.Image();
      img.src = imageUrl;
    };

    if (lightboxImages[currentIndex])
      preloadImage(lightboxImages[currentIndex]);
    const nextIdx = (currentIndex + 1) % lightboxImages.length;
    if (lightboxImages[nextIdx] && nextIdx !== currentIndex)
      preloadImage(lightboxImages[nextIdx]);
    const nextNextIdx = (currentIndex + 2) % lightboxImages.length;
    if (
      lightboxImages.length > 2 &&
      lightboxImages[nextNextIdx] &&
      nextNextIdx !== currentIndex &&
      nextNextIdx !== nextIdx
    ) {
      preloadImage(lightboxImages[nextNextIdx]);
    }
    const prevIdx =
      currentIndex === 0 ? lightboxImages.length - 1 : currentIndex - 1;
    if (lightboxImages[prevIdx] && prevIdx !== currentIndex)
      preloadImage(lightboxImages[prevIdx]);
  }, [lightboxOpen, currentIndex, lightboxImages]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

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
  }, [lightboxOpen, closeLightbox, prevImage, nextImage]);

  // Compute all image URLs in parent so portaled slides get correct src (no stale closure)
  const lightboxImageUrls =
    lightboxOpen && lightboxImages.length > 0
      ? lightboxImages.map((raw) => {
          const src =
            typeof raw === "string" ? raw : raw?.public_id ?? raw?.url ?? null;
          if (!src) return null;
          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
          return isCloudinaryId(src) && cloudName
            ? `https://res.cloudinary.com/${cloudName}/image/upload/q_auto:best,f_auto/${src}`
            : src;
        })
      : [];

  if (!shouldRender) {
    return <div className="text-zinc-400 text-center py-12">No murals yet</div>;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8 space-y-16">
      {murals.map((mural, muralIndex) => (
        <motion.div
          key={mural.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Mural Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-wider">
              {mural.location}
            </h2>
            <p className="text-lg sm:text-xl text-zinc-600 tracking-widest">
              {mural.year}
            </p>
          </div>

          {/* Images Masonry Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6">
            {(mural.images_public_ids || mural.images || []).map(
              (imageId, imageIndex) => {
                // Use public_ids if available, otherwise fall back to images (URLs)
                const imageSource =
                  mural.images_public_ids?.[imageIndex] ||
                  mural.images?.[imageIndex];
                const allImages = mural.images_public_ids || mural.images || [];

                return (
                  <motion.div
                    key={imageIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: imageIndex * 0.05 }}
                    className="relative mb-4 sm:mb-6 break-inside-avoid rounded-lg overflow-hidden shadow-lg cursor-pointer group"
                    onClick={() => openLightbox(allImages, imageIndex)}
                  >
                    <OptimizedImage
                      publicId={imageSource}
                      alt={`${mural.location} ${mural.year} - Image ${
                        imageIndex + 1
                      }`}
                      width={600}
                      height={800}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                      crop="fill"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
                  </motion.div>
                );
              }
            )}
          </div>

          {/* Divider between murals */}
          {muralIndex < murals.length - 1 && (
            <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent mt-8" />
          )}
        </motion.div>
      ))}

      {/* Lightbox - portaled to body so it appears above TopBar */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence mode="wait">
            {lightboxOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center"
                onClick={closeLightbox}
              >
                {/* Close button */}
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 bg-zinc-900/80 text-white hover:bg-red-600 rounded-full p-3 shadow-lg z-10 transition-colors"
                  aria-label="Close carousel"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Image counter */}
                <div className="absolute top-6 left-6 bg-zinc-900/80 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                  {currentIndex + 1} / {lightboxImages.length}
                </div>

                {/* Navigation arrows */}
                {lightboxImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-zinc-900/70 text-white hover:bg-zinc-800 rounded-full p-3 shadow-lg z-10 transition-colors hidden sm:flex items-center justify-center"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-900/70 text-white hover:bg-zinc-800 rounded-full p-3 shadow-lg z-10 transition-colors hidden sm:flex items-center justify-center"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Image with slide animation and swipe - URL from parent (lightboxImageUrls) so image shows in portal */}
                <div className="relative w-full h-full flex items-center justify-center p-8">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={currentIndex}
                      custom={direction}
                      variants={{
                        enter: (d) => ({
                          x: d === 0 ? 0 : d > 0 ? 1000 : -1000,
                          opacity: d === 0 ? 1 : 0,
                          scale: d === 0 ? 1 : 0.8,
                        }),
                        center: {
                          zIndex: 1,
                          x: 0,
                          opacity: 1,
                          scale: 1,
                        },
                        exit: (d) => ({
                          zIndex: 0,
                          x: d < 0 ? 1000 : -1000,
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
                      drag={lightboxImages.length > 1 ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={1}
                      onDragEnd={(e, { offset, velocity }) => {
                        const swipe = Math.abs(offset.x) * velocity.x;
                        if (swipe > 10000) paginate(-1);
                        else if (swipe < -10000) paginate(1);
                      }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                      style={{
                        width: "min(95vw, 1200px)",
                        height: "min(90vh, 900px)",
                        willChange: "transform",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {lightboxImageUrls[currentIndex] ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={lightboxImageUrls[currentIndex]}
                            alt={`Image ${currentIndex + 1}`}
                            fill
                            sizes="(max-width: 768px) 95vw, 1200px"
                            className="object-contain select-none"
                            draggable={false}
                            priority
                          />
                        </div>
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Swipe indicator (mobile only) */}
                {lightboxImages.length > 1 && (
                  <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                    Swipe to navigate
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}

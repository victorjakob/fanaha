"use client";

import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { isCloudinaryId } from "@/lib/cloudinary";
import { cldUrlEnhanced } from "@/lib/cloudinary";

export default function AltarGallery({ artworks }) {
  const [imageErrors, setImageErrors] = useState(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);

  const handleImageError = (artworkId) => {
    setImageErrors((prev) => new Set(prev).add(artworkId));
  };

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setPage([index, 0]);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const paginate = useCallback(
    (newDirection) => {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex + newDirection;
        const length = artworks?.length || 0;
        if (newIndex < 0) {
          setPage([length - 1, newDirection]);
          return length - 1;
        } else if (newIndex >= length) {
          setPage([0, newDirection]);
          return 0;
        } else {
          setPage([newIndex, newDirection]);
          return newIndex;
        }
      });
    },
    [artworks?.length]
  );

  const prevImage = useCallback(() => paginate(-1), [paginate]);
  const nextImage = useCallback(() => paginate(1), [paginate]);

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
  }, [lightboxOpen, prevImage, nextImage, closeLightbox]);

  // Early return after all hooks
  if (!artworks || artworks.length === 0) {
    return (
      <div className="text-zinc-400 text-center py-12">No artworks yet</div>
    );
  }

  // Get all image sources for lightbox
  const lightboxImages = artworks.map((artwork) => ({
    id: artwork.id,
    publicId: artwork.image_public_id || artwork.image_url,
    alt: `Altar artwork`,
  }));

  return (
    <>
      <section className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          {artworks.map((artwork, index) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="relative aspect-square rounded-full overflow-hidden shadow-lg cursor-pointer group"
              onClick={() => openLightbox(index)}
            >
              {imageErrors.has(artwork.id) ? (
                <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-500 text-sm">
                  Image unavailable
                </div>
              ) : (
                <>
                  <OptimizedImage
                    publicId={artwork.image_public_id || artwork.image_url}
                    alt={`Altar artwork ${index + 1}`}
                    width={600}
                    height={600}
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover w-full h-full"
                    aspectRatio="1:1"
                    crop="fill"
                    quality="auto:best"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
                </>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Carousel Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center"
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
              {currentIndex + 1} / {artworks.length}
            </div>

            {/* Navigation arrows */}
            {artworks.length > 1 && (
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

            {/* Carousel image with swipe */}
            <div className="relative w-full h-full flex items-center justify-center p-8">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
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
                  drag={artworks.length > 1 ? "x" : false}
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
                    aspectRatio: "1 / 1",
                  }}
                >
                  {(() => {
                    const currentArtwork = lightboxImages[currentIndex];
                    const imageSource = currentArtwork.publicId;

                    // Convert public_id to URL if needed - use original quality
                    let imageUrl;
                    if (isCloudinaryId(imageSource)) {
                      const cloudName =
                        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                      if (!cloudName) {
                        throw new Error(
                          "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured. Please set it in your environment variables."
                        );
                      }
                      // Use original image with best quality, no size constraints
                      imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto:best,f_auto/${imageSource}`;
                    } else {
                      imageUrl = imageSource;
                    }

                    return (
                      <div
                        className="relative w-full h-full rounded-full overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={imageUrl}
                          alt={currentArtwork.alt}
                          className="w-full h-full object-cover select-none"
                          draggable={false}
                        />
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Swipe indicator (mobile only) */}
            {artworks.length > 1 && (
              <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                Swipe to navigate
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

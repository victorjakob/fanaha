"use client";

import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";
import Image from "next/image";
import { isCloudinaryId } from "@/lib/cloudinary";
import { useState, useEffect, useCallback } from "react";

export default function ExhibitionsGallery({ exhibitions }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);

  const shouldRender = exhibitions && exhibitions.length > 0;

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

  if (!shouldRender) {
    return (
      <div className="text-zinc-400 text-center py-12">No exhibitions yet</div>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8 space-y-16">
      {exhibitions.map((exhibition, exhibitionIndex) => (
        <motion.div
          key={exhibition.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Exhibition Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-wider">
              {exhibition.gallery}
            </h2>
            <p className="text-lg sm:text-xl text-zinc-600 tracking-widest">
              {exhibition.year} • {exhibition.city}, {exhibition.country}
            </p>
            {exhibition.about && (
              <p className="text-base sm:text-lg text-zinc-700 max-w-3xl mx-auto mt-4 whitespace-pre-wrap leading-relaxed">
                {exhibition.about}
              </p>
            )}
          </div>

          {/* Images Masonry Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6">
            {(exhibition.images_public_ids || exhibition.images || []).map((imageId, imageIndex) => {
              // Use public_ids if available, otherwise fall back to images (URLs)
              const imageSource = exhibition.images_public_ids?.[imageIndex] || exhibition.images?.[imageIndex];
              const allImages = exhibition.images_public_ids || exhibition.images || [];
              
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
                    alt={`${exhibition.gallery} ${exhibition.year} - Image ${imageIndex + 1}`}
                    width={1200}
                    height={1800}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                    crop="fit"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
                </motion.div>
              );
            })}
          </div>

          {/* Divider between exhibitions */}
          {exhibitionIndex < exhibitions.length - 1 && (
            <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent mt-8" />
          )}
        </motion.div>
      ))}

      {/* Lightbox */}
      <AnimatePresence mode="wait">
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-4xl hover:text-zinc-300 transition-colors z-10"
              aria-label="Close"
            >
              ×
            </button>

            {/* Previous button */}
            {lightboxImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 text-white text-4xl hover:text-zinc-300 transition-colors z-10 hidden sm:block"
                aria-label="Previous"
              >
                ‹
              </button>
            )}

            {/* Image with swipe */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={page[0]}
                  custom={direction}
                  variants={{
                    enter: (direction) => ({
                      x: direction > 0 ? 1000 : -1000,
                      opacity: 0,
                    }),
                    center: {
                      zIndex: 1,
                      x: 0,
                      opacity: 1,
                    },
                    exit: (direction) => ({
                      zIndex: 0,
                      x: direction < 0 ? 1000 : -1000,
                      opacity: 0,
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  drag={lightboxImages.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = Math.abs(offset.x) * velocity.x;
                    if (swipe > 10000) {
                      paginate(-1);
                    } else if (swipe < -10000) {
                      paginate(1);
                    }
                  }}
                  className="absolute w-full h-full flex items-center justify-center p-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  {(() => {
                    const imageSource = lightboxImages[currentIndex];
                    // Convert public_id to URL if needed - use original quality and dimensions
                    let imageUrl;
                    if (isCloudinaryId(imageSource)) {
                      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
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
                        className="relative"
                        style={{ width: "min(95vw, 1200px)", height: "min(90vh, 900px)" }}
                      >
                        <Image
                          src={imageUrl}
                          alt={`Image ${currentIndex + 1}`}
                          fill
                          sizes="95vw"
                          className="object-contain select-none"
                          draggable={false}
                        />
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next button */}
            {lightboxImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 text-white text-4xl hover:text-zinc-300 transition-colors z-10 hidden sm:block"
                aria-label="Next"
              >
                ›
              </button>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm z-10">
              {currentIndex + 1} / {lightboxImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";
import { isCloudinaryId } from "@/lib/cloudinary";
import { useState, useEffect } from "react";

export default function OraclesProjectsGallery({ items }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);

  const shouldRender = items && items.length > 0;

  const openLightbox = (images, index) => {
    setLightboxImages(images);
    setCurrentIndex(index);
    setPage([index, 0]);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImages([]);
    setCurrentIndex(0);
  };

  const paginate = (newDirection) => {
    let newIndex = currentIndex + newDirection;
    if (newIndex < 0) {
      newIndex = lightboxImages.length - 1;
    } else if (newIndex >= lightboxImages.length) {
      newIndex = 0;
    }
    setCurrentIndex(newIndex);
    setPage([newIndex, newDirection]);
  };

  const nextImage = () => paginate(1);
  const prevImage = () => paginate(-1);

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
  }, [lightboxOpen, currentIndex, lightboxImages.length]);

  if (!shouldRender) {
    return <div className="text-zinc-400 text-center py-12">No items yet</div>;
  }

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8 space-y-16">
      {items.map((item, itemIndex) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Item Header */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-wider">
              {item.name}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base text-zinc-600">
              <span className="tracking-widest">{item.date}</span>
              {item.publisher && (
                <>
                  <span className="text-zinc-400">•</span>
                  <span className="tracking-wide">{item.publisher}</span>
                </>
              )}
            </div>
          </div>

          {/* About Section */}
          {item.about && (
            <div className="max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto">
              <p className="text-base sm:text-lg text-zinc-700 leading-loose tracking-wide text-center whitespace-pre-line px-4">
                {item.about}
              </p>
            </div>
          )}

          {/* Images Masonry Grid */}
          {(item.images_public_ids || item.images || []).length > 0 && (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6">
              {(item.images_public_ids || item.images || []).map((imageId, imageIndex) => {
                // Use public_ids if available, otherwise fall back to images (URLs)
                const imageSource = item.images_public_ids?.[imageIndex] || item.images?.[imageIndex];
                const allImages = item.images_public_ids || item.images || [];
                
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
                      alt={`${item.name} - Image ${imageIndex + 1}`}
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
              })}
            </div>
          )}

          {/* Divider between items */}
          {itemIndex < items.length - 1 && (
            <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent mt-12" />
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
                      <img
                        src={imageUrl}
                        alt={`Image ${currentIndex + 1}`}
                        className="max-w-full max-h-full object-contain select-none"
                        style={{ width: "auto", height: "auto", maxWidth: "95vw", maxHeight: "90vh" }}
                        draggable={false}
                      />
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

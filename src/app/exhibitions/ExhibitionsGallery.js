"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

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
            {exhibition.images.map((imageUrl, imageIndex) => (
              <motion.div
                key={imageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: imageIndex * 0.05 }}
                className="relative mb-4 sm:mb-6 break-inside-avoid rounded-lg overflow-hidden shadow-lg cursor-pointer group"
                onClick={() => openLightbox(exhibition.images, imageIndex)}
              >
                <img
                  src={imageUrl}
                  alt={`${exhibition.gallery} ${exhibition.year} - Image ${
                    imageIndex + 1
                  }`}
                  className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
              </motion.div>
            ))}
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
                  <img
                    src={lightboxImages[currentIndex]}
                    alt={`Image ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain select-none"
                    draggable={false}
                  />
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

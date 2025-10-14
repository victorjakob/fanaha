"use client";
import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import Image from "next/image";

export default function AlchemyArtPieceGallery({ images, name }) {
  // Hooks must be called before any early returns
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [[page, direction], setPage] = useState([0, 0]);

  // Early return check - but must be after all hooks
  const shouldRender = images && images.length >= 2;
  const galleryImages = shouldRender ? images.slice(1) : [];

  const openLightbox = (idx) => {
    setLightboxIdx(idx);
    setPage([idx, 0]);
  };

  const closeLightbox = () => setLightboxIdx(null);

  const paginate = (newDirection) => {
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
  };

  const prevImage = () => paginate(-1);
  const nextImage = () => paginate(1);

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
            <Image
              src={img}
              alt={`${name} detail ${i + 1}`}
              width={160}
              height={160}
              className="object-cover rounded-xl"
              style={{ width: "100%", height: "100%" }}
            />
          </motion.button>
        ))}
      </div>
      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            tabIndex={-1}
          >
            <motion.div
              className="relative flex flex-col items-center w-full h-full"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={lightboxIdx}
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
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = Math.abs(offset.x) * velocity.x;

                    if (swipe < -10000) {
                      nextImage();
                    } else if (swipe > 10000) {
                      prevImage();
                    }
                  }}
                  className="absolute flex items-center justify-center w-full h-full"
                >
                  <Image
                    src={galleryImages[lightboxIdx]}
                    alt={`${name} detail ${lightboxIdx + 1}`}
                    width={800}
                    height={800}
                    className="rounded-xl shadow-2xl"
                    style={{
                      maxWidth: "90vw",
                      maxHeight: "80vh",
                      objectFit: "contain",
                      backgroundColor: "transparent",
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Close button */}
              <button
                className="absolute top-4 right-4 bg-zinc-900/80 text-white hover:bg-red-600 rounded-full p-3 shadow-lg z-10"
                onClick={closeLightbox}
                aria-label="Close image preview"
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

              {/* Navigation arrows - hidden on mobile, shown on desktop */}
              <button
                className="hidden sm:block absolute top-1/2 left-4 -translate-y-1/2 bg-zinc-900/70 text-white hover:bg-purple-700 rounded-full p-3 shadow-lg"
                onClick={prevImage}
                aria-label="Previous image"
              >
                <svg
                  className="w-8 h-8"
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
                className="hidden sm:block absolute top-1/2 right-4 -translate-y-1/2 bg-zinc-900/70 text-white hover:bg-purple-700 rounded-full p-3 shadow-lg"
                onClick={nextImage}
                aria-label="Next image"
              >
                <svg
                  className="w-8 h-8"
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

              {/* Swipe indicator (mobile only) */}
              <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                Swipe to navigate
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

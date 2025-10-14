"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function BackgroundSlideshow({ desktopImages, mobileImages }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [images, setImages] = useState(desktopImages);
  const [isFirst, setIsFirst] = useState(true);
  const [isFirstImageLoaded, setIsFirstImageLoaded] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState(new Set());
  const intervalRef = useRef();

  // Detect screen size and set images
  useEffect(() => {
    function updateImages() {
      if (window.innerWidth < 640) {
        setImages(mobileImages);
      } else {
        setImages(desktopImages);
      }
    }
    updateImages();
    window.addEventListener("resize", updateImages);
    return () => window.removeEventListener("resize", updateImages);
  }, [desktopImages, mobileImages]);

  // Pick a random start image on mount or images change
  useEffect(() => {
    if (images.length > 0) {
      const idx = Math.floor(Math.random() * images.length);
      setCurrentIdx(idx);
      setIsFirst(true);
      setIsFirstImageLoaded(false);
    }
  }, [images]);

  // Auto-fade to a new random image every 6 seconds
  useEffect(() => {
    if (!images.length) return;
    intervalRef.current = setInterval(() => {
      setCurrentIdx((prevIdx) => {
        let nextIdx;
        do {
          nextIdx = Math.floor(Math.random() * images.length);
        } while (images.length > 1 && nextIdx === prevIdx);
        return nextIdx;
      });
      setIsFirst(false);
    }, 6000);
    return () => clearInterval(intervalRef.current);
  }, [images]);

  // Preload all images on mount
  useEffect(() => {
    if (images.length === 0) return;

    images.forEach((src) => {
      const img = new window.Image();
      img.onload = () => {
        setPreloadedImages((prev) => new Set([...prev, src]));
      };
      img.src = src;
    });
  }, [images]);

  // Mark first image as loaded
  useEffect(() => {
    if (images.length > 0 && preloadedImages.has(images[currentIdx])) {
      setIsFirstImageLoaded(true);
    }
  }, [images, currentIdx, preloadedImages]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        backgroundColor: "#0a0a0a", // Dark fallback background
      }}
      aria-hidden="true"
    >
      {/* Preload first image */}
      {images.length > 0 && (
        <div style={{ display: "none" }}>
          <Image
            src={images[currentIdx]}
            alt=""
            width={1}
            height={1}
            priority
          />
        </div>
      )}

      <AnimatePresence initial={false}>
        <motion.div
          key={images[currentIdx]}
          initial={{ opacity: isFirst ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: isFirst ? 0 : 1.6,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <Image
            src={images[currentIdx]}
            alt="Background artwork"
            fill
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
            priority={isFirst}
            quality={90}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

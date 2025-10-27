"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function TopBar({ menuOpen, setMenuOpen }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showClickOverlay, setShowClickOverlay] = useState(false);

  useEffect(() => {
    // Check if click overlay has been shown in this session
    const hasShownClick = sessionStorage.getItem("clickOverlayShown");

    if (!hasShownClick) {
      setShowClickOverlay(true);
      sessionStorage.setItem("clickOverlayShown", "true");

      const timer = setTimeout(() => {
        setShowClickOverlay(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isHovered && showClickOverlay) {
      const timer = setTimeout(() => {
        setShowClickOverlay(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isHovered, showClickOverlay]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Set initial scroll state immediately
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="pt-12 fixed top-0 left-0 w-full flex justify-center items-center z-50"
      style={{ height: 72, pointerEvents: "none" }}
    >
      <motion.button
        className="transition p-1 relative"
        style={{
          marginTop: 12,
          pointerEvents: "auto",
          outline: "none",
          border: "none",
          borderRadius: "50%",
          background: "transparent",
          backdropFilter: "none",
          boxShadow: "none",
          opacity: menuOpen ? 0.7 : 1,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Open menu"
        tabIndex={0}
        onClick={() => setMenuOpen(!menuOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setMenuOpen(!menuOpen);
        }}
        initial={{ opacity: 1 }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0,
        }}
        whileHover={{
          scale: 1.08,
          transition: { duration: 0.15, ease: "easeOut" },
        }}
        whileTap={{
          scale: 0.95,
          transition: { duration: 0.08 },
        }}
      >
        <div
          className={`transition-all duration-700 ease-in-out ${
            isScrolled
              ? "w-12 h-12 sm:w-14 sm:h-14"
              : "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
          }`}
          style={{
            willChange: "transform",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "translateZ(0)",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {/* Full logo - always mounted */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                overflow: "hidden",
                opacity: isHovered ? 0 : 1,
                transition: "opacity 0.15s ease-in-out",
              }}
            >
              <Image
                src="/logo/logo-space-full.jpeg"
                alt="Logo"
                width={112}
                height={112}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                draggable={false}
              />
            </div>
            {/* Bright logo - always mounted */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "0.5px solid rgba(100,100,200,0.7)",
                overflow: "hidden",
                boxSizing: "border-box",
                opacity: isHovered ? 1 : 0,
                transition: "opacity 0.15s ease-in-out",
              }}
            >
              <Image
                src="/logo/logo-space-bright.png"
                alt="Logo"
                width={112}
                height={112}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                draggable={false}
              />
            </div>
          </div>
        </div>
        {showClickOverlay && (
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 10,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 2.5,
              times: [0, 0.15, 0.8, 1],
              ease: "easeInOut",
            }}
          >
            <motion.span
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "white",
                letterSpacing: "1.5px",
                textShadow: "0 3px 12px rgba(0, 0, 0, 0.9)",
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 1, 1, 1, 1, 1, 1, 0],
                scale: [1, 1, 1.15, 1, 1.15, 1, 0.9, 0.6, 0],
              }}
              transition={{
                duration: 2.5,
                times: [0, 0.15, 0.3, 0.4, 0.55, 0.65, 0.75, 0.9, 1],
                ease: "easeInOut",
              }}
            >
              click
            </motion.span>
          </motion.div>
        )}
      </motion.button>
    </header>
  );
}

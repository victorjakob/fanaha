"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function TopBar({ menuOpen, setMenuOpen }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // (removed) one-time "click" onboarding overlay
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Set initial scroll state immediately
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track desktop viewport so we can tweak spacing only for large screens
  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Detect touch device to disable hover effects on mobile
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          // @ts-ignore
          navigator.msMaxTouchPoints > 0
      );
    };
    checkTouchDevice();
  }, []);

  return (
    <header
      className="pt-4 sm:pt-12 fixed top-0 left-0 w-full flex justify-center items-center z-50 h-[96px] sm:h-[72px]"
      style={{ pointerEvents: "none" }}
    >
      <motion.button
        className="transition p-1 relative"
        style={{
          // Add extra breathing room only on large screens when logo is in "big" state
          marginTop: !isScrolled && isDesktop ? 12 : 0,
          pointerEvents: "auto",
          outline: "none",
          border: "none",
          borderRadius: "50%",
          background: "transparent",
          backdropFilter: "none",
          boxShadow: "none",
          opacity: menuOpen ? 0.7 : 1,
        }}
        onMouseEnter={() => {
          if (!isTouchDevice) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (!isTouchDevice) setIsHovered(false);
        }}
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
        whileHover={
          !isTouchDevice
            ? {
                scale: 1.08,
                transition: { duration: 0.15, ease: "easeOut" },
              }
            : {}
        }
        whileTap={{
          scale: 0.95,
          transition: { duration: 0.08 },
        }}
      >
        <div
          className={`transition-all duration-700 ease-in-out ${
            isScrolled
              ? "w-[64px] h-[64px] sm:w-14 sm:h-14"
              : "w-[80px] h-[80px] sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
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
      </motion.button>
    </header>
  );
}

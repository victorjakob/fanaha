"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HamburgerMenu({ menuOpen, onMenuToggle }) {
  const [orderClicked, setOrderClicked] = useState(false);

  useEffect(() => {
    if (!orderClicked) return;
    const t = window.setTimeout(() => setOrderClicked(false), 3000);
    return () => window.clearTimeout(t);
  }, [orderClicked]);

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-3">
      <Link
        href="/order"
        onPointerDown={() => setOrderClicked(true)}
        onClick={() => setOrderClicked(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOrderClicked(true);
        }}
        aria-busy={orderClicked}
        className="relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#191a2d_0%,#2a254d_55%,#865c95_130%)] hover:bg-[linear-gradient(135deg,#2a254d_0%,#191a2d_60%,#865c95_140%)] px-5 py-2.5 text-xs sm:text-sm tracking-widest text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03] border border-[#865c95]/35 hover:border-[#865c95]/60"
        style={{
          fontFamily: "var(--font-house-minimalist), sans-serif",
          fontWeight: 700,
        }}
      >
        {/* click feedback (covers slow navigations) */}
        {orderClicked && (
          <span className="pointer-events-none absolute inset-0">
            <span className="absolute inset-0 opacity-30 animate-pulse bg-white/10" />
            <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          </span>
        )}

        <span className={`relative ${orderClicked ? "opacity-95" : ""}`}>
          Custom Order
        </span>
      </Link>

      <motion.button
        className="p-2.5 sm:p-3 rounded-full bg-[linear-gradient(135deg,#191a2d_0%,#2a254d_65%)] backdrop-blur-md border border-[#865c95]/30 shadow-lg hover:shadow-xl hover:bg-[linear-gradient(135deg,#2a254d_0%,#191a2d_70%)] transition-all duration-300 group"
        onClick={() => onMenuToggle(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          rotate: menuOpen ? 180 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{
          scale: 1.04,
          borderColor: "rgba(134, 92, 149, 0.6)",
        }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-5 h-4 sm:w-6 sm:h-5 flex flex-col justify-between relative">
          <motion.span
            className="block w-full h-[2px] sm:h-0.5 bg-white rounded-full origin-center"
            style={{
              boxShadow: menuOpen ? "0 0 10px rgba(134, 92, 149, 0.55)" : "none",
            }}
            animate={{
              rotate: menuOpen ? 45 : 0,
              y: menuOpen ? 7 : 0,
              backgroundColor: menuOpen ? "rgb(134, 92, 149)" : "white",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
          <motion.span
            className="block w-full h-[2px] sm:h-0.5 bg-white rounded-full"
            animate={{
              opacity: menuOpen ? 0 : 1,
              scale: menuOpen ? 0 : 1,
              x: menuOpen ? 10 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          />
          <motion.span
            className="block w-full h-[2px] sm:h-0.5 bg-white rounded-full origin-center"
            style={{
              boxShadow: menuOpen ? "0 0 10px rgba(134, 92, 149, 0.55)" : "none",
            }}
            animate={{
              rotate: menuOpen ? -45 : 0,
              y: menuOpen ? -7 : 0,
              backgroundColor: menuOpen ? "rgb(134, 92, 149)" : "white",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>

        {/* Subtle glow effect when menu is open */}
        {menuOpen && (
          <motion.div
            className="absolute inset-0 rounded-full blur-xl"
            style={{ backgroundColor: "rgba(134, 92, 149, 0.16)" }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.5 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.button>
    </div>
  );
}

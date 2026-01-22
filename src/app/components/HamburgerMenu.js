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
    <motion.div
      className="fixed top-4 left-4 right-4 sm:top-6 sm:left-auto sm:right-6 z-50 flex items-start sm:items-center justify-between sm:justify-end gap-3"
      initial={{ opacity: 0, scale: 0.9, y: -16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
        <Link
          href="/order"
          onPointerDown={() => setOrderClicked(true)}
          onClick={() => setOrderClicked(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setOrderClicked(true);
          }}
          aria-busy={orderClicked}
          className="relative inline-flex items-center justify-center overflow-hidden rounded-full px-5 py-2.5 text-xs sm:text-sm tracking-widest shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.03] border bg-white/90 text-[#191a2d] border-[#865c95]/35 hover:border-[#865c95]/55 hover:bg-white sm:shadow-md sm:hover:shadow-lg sm:bg-[linear-gradient(135deg,#191a2d_0%,#2a254d_55%,#865c95_130%)] sm:hover:bg-[linear-gradient(135deg,#2a254d_0%,#191a2d_60%,#865c95_140%)] sm:text-white sm:border-[#865c95]/35 sm:hover:border-[#865c95]/60"
          style={{
            fontFamily: "var(--font-house-minimalist), sans-serif",
            fontWeight: 700,
          }}
        >
          {/* click feedback (covers slow navigations) */}
          {orderClicked && (
            <span className="pointer-events-none absolute inset-0">
              <span className="absolute inset-0 opacity-30 animate-pulse bg-black/5 sm:bg-white/10" />
              <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-black/10 to-transparent sm:via-white/35" />
            </span>
          )}

          <span className={`relative ${orderClicked ? "opacity-95" : ""}`}>
            <span className="sm:hidden inline-flex flex-col items-center leading-none text-center">
              Custom
              <br />
              Order
            </span>
            <span className="hidden sm:inline">Custom Order</span>
          </span>
        </Link>

      <motion.button
        className="p-2.5 sm:p-3 rounded-full bg-[linear-gradient(135deg,#191a2d_0%,#2a254d_65%)] backdrop-blur-md border border-[#865c95]/25 shadow-md hover:shadow-lg hover:bg-[linear-gradient(135deg,#2a254d_0%,#191a2d_70%)] transition-all duration-300 group"
        onClick={() => onMenuToggle(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        initial={false}
        animate={{ rotate: menuOpen ? 180 : 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        whileHover={{
          scale: 1.03,
          borderColor: "rgba(134, 92, 149, 0.6)",
        }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-4 h-3.5 sm:w-5 sm:h-4 flex flex-col justify-between relative">
          <motion.span
            className="block w-full h-[1.5px] sm:h-[1.5px] bg-white rounded-full origin-center"
            style={{
              boxShadow: menuOpen ? "0 0 10px rgba(134, 92, 149, 0.55)" : "none",
            }}
            animate={{
              rotate: menuOpen ? 45 : 0,
              y: menuOpen ? 6 : 0,
              backgroundColor: menuOpen ? "rgb(134, 92, 149)" : "white",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
          <motion.span
            className="block w-full h-[1.5px] sm:h-[1.5px] bg-white rounded-full"
            animate={{
              opacity: menuOpen ? 0 : 1,
              scale: menuOpen ? 0 : 1,
              x: menuOpen ? 10 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          />
          <motion.span
            className="block w-full h-[1.5px] sm:h-[1.5px] bg-white rounded-full origin-center"
            style={{
              boxShadow: menuOpen ? "0 0 10px rgba(134, 92, 149, 0.55)" : "none",
            }}
            animate={{
              rotate: menuOpen ? -45 : 0,
              y: menuOpen ? -6 : 0,
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
    </motion.div>
  );
}

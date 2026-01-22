"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HamburgerMenu({ menuOpen, onMenuToggle }) {
  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-3">
      <Link
        href="/order"
        className="inline-flex items-center rounded-full bg-[#191a2d]/95 hover:bg-[#2a254d]/95 px-5 py-2.5 text-xs sm:text-sm tracking-widest text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03] border border-[#865c95]/35 hover:border-[#865c95]/55"
        style={{
          fontFamily: "var(--font-house-minimalist), sans-serif",
          fontWeight: 700,
        }}
      >
        Custom Order
        
      </Link>

      <motion.button
        className="p-2.5 sm:p-3 rounded-full bg-[#191a2d]/95 backdrop-blur-md border border-[#865c95]/30 shadow-lg hover:shadow-xl hover:bg-[#2a254d]/95 transition-all duration-300 group"
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

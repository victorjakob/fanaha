"use client";

import { motion } from "framer-motion";

export default function HamburgerMenu({ menuOpen, onMenuToggle }) {
  return (
    <motion.button
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 sm:p-3 rounded-full bg-zinc-900/90 backdrop-blur-md border border-zinc-700/60 shadow-xl hover:shadow-2xl hover:bg-zinc-800 transition-all duration-300 group"
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
        scale: 1.08,
        borderColor: "rgba(168, 85, 247, 0.5)",
      }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-5 h-4 sm:w-6 sm:h-5 flex flex-col justify-between relative">
        <motion.span
          className="block w-full h-[2px] sm:h-0.5 bg-white rounded-full origin-center"
          style={{
            boxShadow: menuOpen ? "0 0 8px rgba(168, 85, 247, 0.6)" : "none",
          }}
          animate={{
            rotate: menuOpen ? 45 : 0,
            y: menuOpen ? 7 : 0,
            backgroundColor: menuOpen ? "rgb(168, 85, 247)" : "white",
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
            boxShadow: menuOpen ? "0 0 8px rgba(168, 85, 247, 0.6)" : "none",
          }}
          animate={{
            rotate: menuOpen ? -45 : 0,
            y: menuOpen ? -7 : 0,
            backgroundColor: menuOpen ? "rgb(168, 85, 247)" : "white",
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>
      
      {/* Subtle glow effect when menu is open */}
      {menuOpen && (
        <motion.div
          className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.5 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
}

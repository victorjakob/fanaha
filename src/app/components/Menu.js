"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function Menu({ menuOpen, onMenuToggle }) {
  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          key="menu-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 w-screen h-screen bg-black/80 z-[99] overflow-y-auto"
          onClick={() => onMenuToggle(false)}
          aria-modal="true"
          role="dialog"
        >
          {/* Centered content wrapper */}
          <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.35,
              }}
              className="bg-none rounded-3xl px-[clamp(20px,8vw,64px)] py-[clamp(10px,4vw,32px)] w-[clamp(220px,80vw,420px)] max-w-[96vw] text-white text-center flex flex-col items-center justify-center box-border"
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="list-none p-0 m-0 w-full flex flex-col items-center gap-[clamp(2px,0.5vw,8px)]">
                {[
                  { label: "Alchemical Art Pieces", href: "/alchemy" },
                  { label: "Altar Artwork", href: "#" },
                  { label: "Murals", href: "#" },
                  { label: "Exhibitions", href: "#" },
                  { label: "Oracles & Projects", href: "#" },
                  { label: "What I Offer", href: "#" },
                  { label: "Contact Me", href: "#" },
                ].map((item, index) => (
                  <motion.li
                    key={item.label}
                    className="m-0 w-full flex justify-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 24,
                      delay: 0.35 + index * 0.13,
                    }}
                  >
                    <Link href={item.href} className="w-full">
                      <motion.h2
                        className="text-white no-underline text-[clamp(18px,2.5vw,28px)] font-normal tracking-wide inline-block py-[clamp(8px,1vw,14px)] rounded-xl w-full outline-none touch-manipulation whitespace-nowrap overflow-hidden text-ellipsis text-center cursor-pointer relative z-[1] focus-visible:ring-2 focus-visible:ring-violet-300 transition-colors duration-200 ease-out hover:text-purple-100 hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] focus:text-amber-100 focus:drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                        tabIndex={0}
                        aria-label={item.label}
                        whileHover={{
                          scale: 1.08,
                          transition: {
                            type: "spring",
                            stiffness: 500,
                            damping: 15,
                          },
                        }}
                        whileFocus={{
                          scale: 1.08,
                          transition: {
                            type: "spring",
                            stiffness: 500,
                            damping: 15,
                          },
                        }}
                        onClick={() => onMenuToggle(false)}
                      >
                        {item.label}
                      </motion.h2>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

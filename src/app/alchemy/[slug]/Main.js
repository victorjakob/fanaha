"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { formatISK } from "@/util/formatPrice";
import OrderModal from "@/app/alchemy/[slug]/OrderModal";

export default function AlchemyArtPieceDetailMain({ piece }) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const mainImage = piece.main_image || (piece.images && piece.images[0]);

  return (
    <motion.section
      className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-10 px-4"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {mainImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="relative rounded-full overflow-hidden mb-8 flex items-center justify-center w-[80vw] max-w-[420px] h-[80vw] max-h-[420px]"
        >
          <div
            className="absolute inset-0 z-0 rounded-full pointer-events-none"
            style={{
              background: piece.palette?.[0] || "#a259f7",
              filter: "blur(32px)",
              opacity: 0.55,
            }}
          />
          <Image
            src={mainImage}
            alt={piece.name}
            width={420}
            height={420}
            className="rounded-full w-full h-full object-contain relative z-10"
            priority
          />
        </motion.div>
      )}

      <motion.h1
        className="text-black mb-6 sm:mb-8 tracking-widest text-center px-4 whitespace-nowrap"
        style={{
          fontSize: "clamp(1.5rem, 5vw, 3.75rem)",
          lineHeight: "1.2",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
      >
        {piece.name}
      </motion.h1>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 text-center">
        {piece.dimensions && (
          <span className="text-xl sm:text-2xl text-black font-light tracking-[0.15em] uppercase">
            {piece.dimensions}
          </span>
        )}
        {piece.dimensions && piece.year && (
          <span className="text-xl sm:text-2xl text-black/40 font-light">
            •
          </span>
        )}
        {piece.year && (
          <span className="text-xl sm:text-2xl text-black font-light tracking-[0.15em]">
            {piece.year}
          </span>
        )}
      </div>

      <div className="text-xl sm:text-2xl text-black font-semibold py-6 my-6 border-y border-black/20 text-center tracking-[0.15em]">
        {piece.status === "available" && piece.price
          ? formatISK(piece.price)
          : piece.status === "sold"
          ? "SOLD"
          : piece.status === "commission"
          ? "COMMISSION"
          : piece.price
          ? formatISK(piece.price)
          : "-"}
      </div>

      {piece.description && (
        <motion.p
          className="text-base sm:text-lg text-black/60 max-w-2xl mx-auto mb-8 leading-loose tracking-wide text-center px-6"
          style={{ fontWeight: 300 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        >
          {piece.description}
        </motion.p>
      )}

      {/* Order Button - Only show for available pieces */}
      {piece.available && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="mt-6"
        >
          <motion.button
            onClick={() => setIsOrderModalOpen(true)}
            className="group relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-light text-black border border-black/30 hover:border-black/50 rounded-full transition-colors duration-300 ease-out hover:bg-black/5 focus:outline-none focus:ring-1 focus:ring-black/50 focus:ring-offset-2 focus:ring-offset-transparent"
            whileHover={{
              scale: 1.01,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            whileTap={{
              scale: 0.99,
              transition: { duration: 0.1 },
            }}
          >
            <span className="relative flex items-center gap-3 text-lg tracking-widest uppercase">
              <motion.span
                className="relative z-10 flex"
                whileHover="hover"
                variants={{
                  hover: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0,
                    },
                  },
                }}
              >
                {"Order Art Piece".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    className={char === " " ? "w-2" : ""}
                    initial={{ y: 0 }}
                    variants={{
                      hover: {
                        y: [0, -8, 0],
                        transition: {
                          duration: 0.6,
                          ease: "easeInOut",
                        },
                      },
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.span>
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        artPieceName={piece.name}
      />
    </motion.section>
  );
}

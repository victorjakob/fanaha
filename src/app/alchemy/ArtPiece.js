"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function AlchemyArtPiece({
  slug,
  title,
  mainImage,
  status,
  dimensions,
  palette,
  index,
}) {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    router.push(`/alchemy/${slug}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      setIsClicked(true);
      router.push(`/alchemy/${slug}`);
    }
  };

  // Create a background gradient from the palette
  let bgGradient = undefined;
  if (palette && palette.length > 1) {
    bgGradient = `radial-gradient(circle at 60% 40%, ${palette
      .map((color, i) => `${color} ${(i * 100) / (palette.length - 1)}%`)
      .join(", ")})`;
  } else if (palette && palette.length === 1) {
    bgGradient = palette[0];
  }

  return (
    <motion.div
      className="relative flex flex-col items-center w-full px-4 sm:px-8 cursor-pointer outline-none group"
      whileHover="hover"
      whileFocus="hover"
      whileTap={{ scale: 0.95 }}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={title}
      style={{ minHeight: 320 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      animate={{
        opacity: isClicked ? 0.5 : 1,
        scale: isClicked ? 0.95 : 1,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Epic animated glow background */}
      {palette && palette.length > 0 && (
        <>
          {/* Primary epic glow */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${palette[0]}40 0%, transparent 60%)`,
              filter: "blur(20px)",
              zIndex: -1,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Secondary epic glow */}
          {palette[1] && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${palette[1]}30 0%, transparent 70%)`,
                filter: "blur(30px)",
                zIndex: -2,
              }}
              animate={{
                scale: [1.2, 1.5, 1.2],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          )}

          {/* Tertiary epic glow */}
          {palette[2] && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${palette[2]}25 0%, transparent 80%)`,
                filter: "blur(40px)",
                zIndex: -3,
              }}
              animate={{
                scale: [1.4, 1.7, 1.4],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          )}

          {/* Dreamy palette background (original) */}
          {bgGradient && (
            <div
              className="absolute inset-0 z-0 rounded-full blur-2xl opacity-60 pointer-events-none"
              style={{
                background: bgGradient,
                filter: "blur(32px)",
                zIndex: 0,
              }}
            />
          )}
        </>
      )}
      <motion.div
        className="relative flex items-center justify-center aspect-square rounded-full overflow-hidden transition-all duration-700 w-[80vw] sm:max-w-lg md:max-w-md lg:max-w-md xl:max-w-md 2xl:max-w-md group-hover:shadow-2xl group-hover:shadow-black/50"
        initial={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        style={{
          filter:
            palette && palette.length > 0
              ? `
            drop-shadow(0 0 20px ${palette[0]}60)
            drop-shadow(0 0 40px ${palette[0]}40)
            drop-shadow(0 0 60px ${palette[0]}30)
            drop-shadow(0 0 80px ${palette[0]}20)
            drop-shadow(0 0 100px ${palette[0]}15)
            ${palette[1] ? `drop-shadow(0 0 120px ${palette[1]}12)` : ""}
            ${palette[1] ? `drop-shadow(0 0 140px ${palette[1]}10)` : ""}
            ${palette[2] ? `drop-shadow(0 0 160px ${palette[2]}08)` : ""}
            ${palette[2] ? `drop-shadow(0 0 180px ${palette[2]}06)` : ""}
            ${palette[3] ? `drop-shadow(0 0 200px ${palette[3]}05)` : ""}
            ${palette[4] ? `drop-shadow(0 0 220px ${palette[4]}04)` : ""}
            ${palette[4] ? `drop-shadow(0 0 240px ${palette[4]}03)` : ""}
          `
              : "drop-shadow(0 0 30px rgba(0,0,0,0.5)) drop-shadow(0 0 60px rgba(0,0,0,0.3)) drop-shadow(0 0 90px rgba(0,0,0,0.2))",
        }}
      >
        <OptimizedImage
          publicId={mainImage}
          alt={title}
          width={2000}
          height={2000}
          sizes="(max-width: 640px) 80vw, (max-width: 768px) 512px, 448px"
          className="object-cover w-full h-full select-none transition-transform duration-300 group-hover:scale-105 rounded-full"
          priority={index !== undefined && index < 3}
          aspectRatio="1:1"
          crop="fill"
          quality="auto:best"
        />
        {/* Black overlay on hover */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          initial={{ opacity: 0 }}
          variants={{ hover: { opacity: 1 } }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
        >
          <span
            className="text-white font-light tracking-wider mb-1 sm:mb-2 drop-shadow-lg text-center px-3 sm:px-4 whitespace-nowrap overflow-hidden"
            style={{
              fontSize: "clamp(1.125rem, 4.5vw, 2.5rem)",
              lineHeight: "1.2",
              display: "block",
              maxWidth: "95%",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </span>
          {dimensions && (
            <span
              className="text-white/70 text-sm sm:text-base md:text-lg leading-loose tracking-wide text-center px-3 sm:px-4 mt-0.5 sm:mt-1"
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontWeight: 200,
              }}
            >
              {dimensions}
            </span>
          )}
        </motion.div>

        {/* Loading overlay when clicked */}
        {isClicked && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/80 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <span className="text-white text-sm font-light tracking-wide">
                Loading...
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Mobile Info Display - shown below image on small screens */}
      <div className="sm:hidden mt-4 text-center space-y-1">
        <h3 className="text-lg font-medium text-black tracking-wide">
          {title}
        </h3>
        {dimensions && (
          <p
            className="text-sm text-black/70 tracking-wide"
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontWeight: 300,
            }}
          >
            {dimensions}
          </p>
        )}
      </div>
    </motion.div>
  );
}

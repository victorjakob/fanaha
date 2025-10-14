"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Logo({ menuOpen }) {
  return (
    <motion.div
      initial={{ scale: 0.05, opacity: 0, y: 40 }}
      animate={
        menuOpen
          ? {
              y: -220,
              opacity: 0,
              scale: 0.85,
              transition: {
                y: { duration: 0.5 },
                opacity: { duration: 0.3, delay: 0.2 },
              },
            }
          : {
              y: 0,
              opacity: 1,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 60,
                damping: 20,
                duration: 2.5,
                scale: {
                  type: "spring",
                  stiffness: 40,
                  damping: 15,
                  duration: 3,
                },
                opacity: {
                  duration: 1.5,
                  delay: 0.3,
                },
              },
            }
      }
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        src="/logo/logo-whitepng.png"
        alt="Site Logo"
        width={400}
        height={400}
        style={{
          maxWidth: "40vw",
          maxHeight: "40vh",
          width: "auto",
          height: "auto",
          objectFit: "contain",
          filter: "drop-shadow(0 4px 32px rgba(0,0,0,0.18))",
          pointerEvents: "none",
          userSelect: "none",
        }}
        priority
      />
    </motion.div>
  );
}

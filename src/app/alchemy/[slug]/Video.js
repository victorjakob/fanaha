"use client";
import { motion } from "framer-motion";

export default function AlchemyArtPieceVideo({ videoUrl }) {
  if (!videoUrl) return null;
  return (
    <motion.section
      className="w-full flex justify-center mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
    >
      <video
        src={videoUrl}
        controls
        className="rounded-xl max-w-xs border border-zinc-700 shadow-lg bg-zinc-900"
        style={{ background: "#181028" }}
      />
    </motion.section>
  );
}

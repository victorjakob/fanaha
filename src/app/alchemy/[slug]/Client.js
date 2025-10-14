"use client";
import { motion } from "framer-motion";
import AlchemyArtPieceDetailMain from "./Main";
import AlchemyArtPieceGallery from "./Gallery";
import InstagramEmbed from "./InstagramEmbed";

export default function AlchemyArtPieceDetailClient({ piece }) {
  const mainImage = piece.main_image || (piece.images && piece.images[0]);

  return (
    <motion.main
      className="flex flex-col items-center w-full min-h-screen pt-23 py-12 px-4 sm:px-8 relative overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {/* Full-screen background image */}
      {mainImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage: `url('${mainImage}')`,
            backgroundSize: "120%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0.11,
          }}
        />
      )}

      <div className="relative z-10 w-full flex flex-col items-center">
        <AlchemyArtPieceDetailMain piece={piece} />
        {piece.video_url && <InstagramEmbed url={piece.video_url} />}
        <AlchemyArtPieceGallery images={piece.images} name={piece.name} />
      </div>
    </motion.main>
  );
}

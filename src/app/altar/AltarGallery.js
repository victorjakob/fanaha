"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AltarGallery({ artworks }) {
  if (!artworks || artworks.length === 0) {
    return (
      <div className="text-zinc-400 text-center py-12">No artworks yet</div>
    );
  }

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
        {artworks.map((artwork, index) => (
          <motion.div
            key={artwork.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="relative aspect-square rounded-full overflow-hidden shadow-lg"
          >
            <Image
              src={artwork.image_url}
              alt={`Altar artwork ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

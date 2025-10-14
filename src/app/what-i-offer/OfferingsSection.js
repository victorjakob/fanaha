"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Map offering titles to their corresponding pages
const getOfferingLinks = (title) => {
  const titleLower = title.toLowerCase();

  if (
    titleLower.includes("alchemical art") ||
    titleLower.includes("commission")
  ) {
    return { seeMore: "/alchemy", getYours: "/contact" };
  } else if (titleLower.includes("altar")) {
    return { seeMore: "/altar", getYours: "/contact" };
  } else if (titleLower.includes("mural")) {
    return { seeMore: "/murals", getYours: "/contact" };
  } else if (titleLower.includes("oracle") || titleLower.includes("project")) {
    return { seeMore: "/oracles-projects", getYours: "/contact" };
  }

  // Default fallback
  return { seeMore: "/contact", getYours: "/contact" };
};

export default function OfferingsSection({ offerings }) {
  if (!offerings || offerings.length === 0) {
    return (
      <div className="text-zinc-400 text-center py-12">
        No offerings available at this time
      </div>
    );
  }

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8 space-y-16 sm:space-y-24">
      {offerings.map((offering, index) => {
        const isEven = index % 2 === 0;
        const links = getOfferingLinks(offering.title);

        return (
          <motion.div
            key={offering.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`grid grid-cols-1 ${
              offering.image_url ? "lg:grid-cols-2" : "lg:grid-cols-1"
            } gap-8 lg:gap-12 items-center ${
              !isEven && offering.image_url ? "lg:grid-flow-dense" : ""
            }`}
          >
            {/* Image */}
            {offering.image_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`relative aspect-square rounded-2xl overflow-hidden shadow-xl ${
                  !isEven ? "lg:col-start-2" : ""
                }`}
              >
                <Image
                  src={offering.image_url}
                  alt={offering.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: isEven ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`space-y-4 ${
                offering.image_url ? "" : "text-center max-w-4xl mx-auto"
              }`}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-wider">
                {offering.title}
              </h2>

              {offering.description && (
                <div className="space-y-4">
                  {offering.description.split("\n\n").map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-base sm:text-lg text-zinc-700 leading-loose tracking-wide whitespace-pre-line"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6">
                <Link
                  href={links.seeMore}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-zinc-400 text-zinc-800 rounded-full font-semibold tracking-wide hover:border-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  See More
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
                <Link
                  href={links.getYours}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-200 text-zinc-900 rounded-full font-semibold tracking-wide hover:bg-zinc-300 transition-colors"
                >
                  Get Yours
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </section>
  );
}

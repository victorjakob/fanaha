"use client";

import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";

export default function ReviewsClient({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <main className="relative flex flex-col items-center w-full min-h-screen pt-32 sm:pt-40 py-6 sm:py-12 px-2 sm:px-8 overflow-hidden">
        {/* Full-screen runes background */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "url('/runes-bg2.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0.08,
          }}
        />

        {/* Background Decorative Image - Left */}
        <div
          className="hidden xl:block fixed left-0 top-0 h-full w-96 pointer-events-none z-0 opacity-20"
          style={{
            backgroundImage: `url('https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752181981/border-right1_y9hahn.png')`,
            backgroundRepeat: "repeat-y",
            backgroundSize: "100px auto",
            backgroundPosition: "left center",
            backgroundAttachment: "fixed",
          }}
        />

        {/* Background Decorative Image - Right */}
        <div
          className="hidden xl:block fixed right-0 top-0 h-full w-96 pointer-events-none z-0 opacity-20"
          style={{
            backgroundImage: `url('https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752181981/border-right1_y9hahn.png')`,
            backgroundRepeat: "repeat-y",
            backgroundSize: "100px auto",
            backgroundPosition: "right center",
            backgroundAttachment: "fixed",
          }}
        />

        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-wider mb-4">
              Testimonials
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600">
              No reviews yet. Check back soon!
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex flex-col items-center w-full min-h-screen pt-32 sm:pt-40 py-6 sm:py-12 px-2 sm:px-8 overflow-hidden">
      {/* Full-screen runes background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/runes-bg2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.08,
        }}
      />

      {/* Background Decorative Image - Left */}
      <div
        className="hidden xl:block fixed left-0 top-0 h-full w-96 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752181981/border-right1_y9hahn.png')`,
          backgroundRepeat: "repeat-y",
          backgroundSize: "100px auto",
          backgroundPosition: "left center",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Background Decorative Image - Right */}
      <div
        className="hidden xl:block fixed right-0 top-0 h-full w-96 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752181981/border-right1_y9hahn.png')`,
          backgroundRepeat: "repeat-y",
          backgroundSize: "100px auto",
          backgroundPosition: "right center",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-wider mb-4">
            Testimonials
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600">
            Shared words from those who experienced the work
          </p>
        </div>

        {/* Reviews Grid */}
        <section className="w-full max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {reviews.map((review, index) => {
              const images =
                review.images_public_ids?.length > 0
                  ? review.images_public_ids
                  : Array.isArray(review.images)
                  ? review.images
                  : [];
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 sm:p-10 shadow-md border border-zinc-200/50 hover:shadow-2xl hover:border-zinc-300 transition-all duration-300 flex flex-col"
                >
                  {/* Client Name */}
                  <div className="mb-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-300/80 to-zinc-300/60" />
                    <p className="text-zinc-900 font-semibold text-lg sm:text-xl tracking-wide whitespace-nowrap">
                      {review.client_name}
                    </p>
                    <div className="h-px flex-1 bg-gradient-to-r from-zinc-300/60 via-zinc-300/80 to-transparent" />
                  </div>

                  {/* Review Text */}
                  <div className="flex-1 mb-6">
                    <p className="text-zinc-700 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                      "{review.review_text}"
                    </p>
                  </div>

                  {images.length > 0 && (
                    <div
                      className={`${
                        images.length === 1
                          ? "grid grid-cols-1"
                          : images.length === 2
                          ? "grid grid-cols-2 gap-3"
                          : "grid grid-cols-2 gap-3"
                      }`}
                    >
                      {images.map((img, imageIndex) => (
                        <motion.div
                          key={`${review.id}-img-${imageIndex}`}
                          initial={{ opacity: 0, scale: 0.98 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.35,
                            delay: 0.15 + imageIndex * 0.08,
                          }}
                          whileHover={{ scale: 1.01 }}
                          className="relative overflow-hidden rounded-2xl"
                        >
                          <OptimizedImage
                            publicId={img}
                            src={img}
                            alt={`Review image ${imageIndex + 1} from ${
                              review.client_name
                            }`}
                            width={1600}
                            height={1600}
                            crop="fit"
                            className="w-full h-auto object-contain"
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

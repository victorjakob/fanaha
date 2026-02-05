"use client";

import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export default function ReviewsClient({ reviews }) {
  const t = useTranslations();
  const containerRef = useRef(null);
  const [columnCount, setColumnCount] = useState(1);
  const columnRefs = useRef([]);
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  // Character limit for truncation (shorter on mobile)
  const getCharLimit = () => {
    if (typeof window === "undefined") return 250;
    return window.innerWidth < 768 ? 200 : 300;
  };

  const [charLimit, setCharLimit] = useState(250);

  useEffect(() => {
    const updateCharLimit = () => {
      setCharLimit(getCharLimit());
    };
    updateCharLimit();
    window.addEventListener("resize", updateCharLimit);
    return () => window.removeEventListener("resize", updateCharLimit);
  }, []);

  const toggleReview = (reviewId) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  const isExpanded = (reviewId) => expandedReviews.has(reviewId);

  const shouldTruncate = (text) => text && text.length > charLimit;

  const getTruncatedText = (text) => {
    if (!text) return "";
    if (!shouldTruncate(text)) return text;
    // Find the last space before the limit to avoid cutting words
    const truncated = text.slice(0, charLimit);
    const lastSpace = truncated.lastIndexOf(" ");
    return lastSpace > charLimit * 0.8
      ? truncated.slice(0, lastSpace) + "..."
      : truncated + "...";
  };

  useEffect(() => {
    const updateColumnCount = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      if (width >= 1024) {
        setColumnCount(3);
      } else if (width >= 768) {
        setColumnCount(2);
      } else {
        setColumnCount(1);
      }
    };

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  // Organize reviews into columns based on actual column heights
  const organizeIntoColumns = () => {
    if (columnCount === 1) return [reviews];

    const columns = Array.from({ length: columnCount }, () => []);
    const heights = Array.from({ length: columnCount }, () => 0);

    reviews.forEach((review) => {
      // Find the shortest column
      const shortestIndex = heights.indexOf(Math.min(...heights));
      columns[shortestIndex].push(review);

      // Better height estimation based on review content
      let estimatedHeight = 150; // Base card height
      if (review.review_text) {
        estimatedHeight += Math.ceil(review.review_text.length / 50) * 24; // Rough text height
      }
      if (review.images_public_ids?.length > 0 || review.images?.length > 0) {
        const imageCount =
          review.images_public_ids?.length || review.images?.length || 0;
        estimatedHeight += imageCount * 200; // Rough image height
      }
      heights[shortestIndex] += estimatedHeight;
    });

    return columns;
  };

  const columns = organizeIntoColumns();
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
              {t("pages.testimonials.title")}
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
            {t("pages.testimonials.title")}
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600">
            {t("pages.testimonials.description")}
          </p>
        </div>

        {/* Reviews Grid */}
        <section className="w-full max-w-7xl mx-auto px-4 py-8">
          <div
            ref={containerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
          >
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex flex-col gap-8 sm:gap-10">
                {column.map((review, itemIndex) => {
                  const images =
                    review.images_public_ids?.length > 0
                      ? review.images_public_ids
                      : Array.isArray(review.images)
                      ? review.images
                      : [];
                  const globalIndex = reviews.indexOf(review);
                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, delay: globalIndex * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 sm:p-10 shadow-md border border-zinc-200/50 hover:shadow-2xl hover:border-zinc-300 transition-all duration-300 flex flex-col"
                    >
                      {/* Decorative Quote Mark */}
                      <div className="mb-3">
                        <svg
                          className="w-8 h-8 sm:w-10 sm:h-10 text-violet-300/50"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 9.005-9.57.996 0 1.917.078 2.75.212v3.803c-1.024-.13-1.862-.196-2.75-.196-3.391 0-5.469 2.013-5.469 5.401v4.441h-3.536zm-14.017 0v-7.391c0-5.704 3.748-9.57 9.02-9.57.985 0 1.917.078 2.75.212v3.803c-1.023-.13-1.863-.196-2.75-.196-3.39 0-5.47 2.013-5.47 5.401v4.441h-3.57z" />
                        </svg>
                      </div>

                      {/* Review Text */}
                      <div className="flex-1 mb-6">
                        <p className="text-zinc-700 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                          {isExpanded(review.id) ||
                          !shouldTruncate(review.review_text)
                            ? review.review_text
                            : getTruncatedText(review.review_text)}
                        </p>
                        {shouldTruncate(review.review_text) && (
                          <button
                            onClick={() => toggleReview(review.id)}
                            className="mt-3 text-violet-600 hover:text-violet-700 font-semibold text-base transition-colors underline underline-offset-2"
                          >
                            {isExpanded(review.id) ? "Read less" : "Read more"}
                          </button>
                        )}
                      </div>

                      {/* Rating (if available) */}
                      {review.rating && (
                        <div className="mb-4 flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-zinc-300 fill-zinc-300"
                              }`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      )}

                      {/* Client Name - at bottom like a signature */}
                      <div className="pt-4 border-t border-zinc-200/60">
                        <p className="text-zinc-900 font-semibold text-base sm:text-lg tracking-wide text-right">
                          — {review.client_name}
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
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

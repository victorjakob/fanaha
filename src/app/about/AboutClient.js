"use client";

import { motion } from "framer-motion";

export default function AboutClient({ content }) {
  // Use content from database, or fall back to defaults
  const title = content?.title || "About Fanaha";
  const subtitle =
    content?.subtitle ||
    "Visionary artist and weaver of soul‑story. Her work lives where Earth meets Ether— a devotion to beauty, breath, and belonging.";
  const bioTitle = content?.bio_title || "A Living Prayer";
  const bioParagraphs = content?.bio_paragraphs || [
    "Fanaha is a conduit for subtle realms, composing experiences where sound, movement, image, and story braid into ritual. Rooted in nature and guided by the feminine, her creations invite you to remember what you already are: wild, tender, whole.",
    "She works with voice and breath, with symbol and silence, with the body as altar and the everyday as sacred ground.",
    "Rather than perform for an audience, she invites a circle—an ecology of presence—where art becomes a ceremony we enter together. In these threshold spaces, grief softens, joy ripens, and belonging returns.",
  ];

  const socials = content?.socials || {
    instagram: "https://instagram.com/fanaha7",
    youtube: "#",
    spotify: "#",
  };

  const pillars = content?.pillars || [
    {
      title: "Nature",
      body: "Earth as muse, breath as metronome. Every offering is a dialogue with wind, stone, tide, and fire.",
    },
    {
      title: "Feminine Wisdom",
      body: "Art as sanctuary for the body to remember: softness is strength; sensitivity is intelligence; presence is power.",
    },
    {
      title: "Ancestral Memory",
      body: "Songs and symbols that honor the ones before us, weaving lineage into modern ritual.",
    },
    {
      title: "Transformation",
      body: "Creation as alchemy—meeting shadow with devotion, turning experience into medicine and beauty.",
    },
  ];

  const milestones = content?.milestones || [
    {
      year: "Origins",
      text: "The first spark: childlike dances in kitchens, humming to rivers, sketching constellations in notebooks.",
    },
    {
      year: "Becoming",
      text: "Study, pilgrimage, experiment. Learning to trust the space between notes and the silence beneath movement.",
    },
    {
      year: "Offerings",
      text: "Live performances, sound journeys, visual works, and intimate circles where art becomes a shared ceremony.",
    },
    {
      year: "Now",
      text: "Fanaha opens portals for remembrance—inviting you to breathe, feel, and belong to your own living myth.",
    },
  ];

  const quote =
    content?.quote ||
    "Art is how I remember what the body always knew— that love is a frequency, and presence is the doorway.";
  const quoteAuthor = content?.quote_author || "— Fanaha";

  return (
    <main className="relative flex flex-col items-center w-full min-h-screen pt-32 sm:pt-40 py-6 sm:py-12 px-4 sm:px-8 overflow-hidden">
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
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12 sm:mb-16"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-6 sm:mb-8 tracking-wider">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-zinc-700 max-w-2xl mx-auto px-4 leading-loose tracking-wide">
            {subtitle}
          </p>
        </motion.div>

        {/* Bio Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="w-full mb-16"
        >
          <h2 className="text-2xl sm:text-3xl mb-6 text-center tracking-wide">
            {bioTitle}
          </h2>
          <div className="space-y-6 text-center">
            {bioParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-base sm:text-lg text-zinc-700 leading-loose tracking-wide px-4 sm:px-8"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Pillars Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="w-full mb-16"
        >
          <h2 className="text-2xl sm:text-3xl mb-8 text-center tracking-wide">
            Pillars of Practice
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/50 shadow-sm"
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-3 tracking-wide">
                  {pillar.title}
                </h3>
                <p className="text-sm sm:text-base text-zinc-700 leading-relaxed tracking-wide">
                  {pillar.body}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="w-full mb-16"
        >
          <h2 className="text-2xl sm:text-3xl mb-8 text-center tracking-wide">
            Path &amp; Becoming
          </h2>
          <p className="text-base sm:text-lg text-zinc-700 leading-loose tracking-wide px-4 sm:px-8 text-center mb-12">
            A journey from hush to hymn. These waypoints sketch a map, but the
            real terrain is felt— in breath, in body, in the shared field.
          </p>
          <div className="space-y-8 max-w-2xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative pl-8 border-l-2 border-zinc-300"
              >
                <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-zinc-400"></div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 tracking-wide">
                  {milestone.year}
                </h3>
                <p className="text-sm sm:text-base text-zinc-700 leading-relaxed tracking-wide">
                  {milestone.text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          className="w-full mb-16"
        >
          <div className="p-8 sm:p-12 rounded-2xl bg-white/50 shadow-sm text-center">
            <blockquote className="text-lg sm:text-xl text-zinc-800 leading-loose tracking-wide italic mb-4">
              &ldquo;{quote}&rdquo;
            </blockquote>
            <p className="text-sm text-zinc-600 tracking-wider">
              {quoteAuthor}
            </p>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="w-full text-center mb-16"
        >
          <h2 className="text-2xl sm:text-3xl mb-8 tracking-wide">Connect</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={socials.instagram}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-full border-2 border-zinc-400 text-zinc-700 font-medium hover:bg-zinc-100 transition-colors tracking-wide"
            >
              Instagram
            </a>
            <a
              href={socials.youtube}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-full border-2 border-zinc-400 text-zinc-700 font-medium hover:bg-zinc-100 transition-colors tracking-wide"
            >
              YouTube
            </a>
            <a
              href={socials.spotify}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-full border-2 border-zinc-400 text-zinc-700 font-medium hover:bg-zinc-100 transition-colors tracking-wide"
            >
              Spotify
            </a>
          </div>
        </motion.div>

        {/* Decorative Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-32 h-32 mx-auto opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-zinc-400"
              />
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-zinc-400"
              />
              <circle
                cx="50"
                cy="50"
                r="25"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-zinc-400"
              />
              <circle
                cx="50"
                cy="50"
                r="2"
                fill="currentColor"
                className="text-zinc-400"
              />
            </svg>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

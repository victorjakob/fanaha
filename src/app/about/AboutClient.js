"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { pickLocalizedJson, pickLocalizedText } from "@/lib/db-i18n";

export default function AboutClient({ content }) {
  const t = useTranslations();
  const locale = useLocale();
  // Use content from database, or fall back to defaults
  const title =
    (content && pickLocalizedText(content, "title", locale)) ||
    t("profile.aboutFanaha");
  const subtitle =
    (content && pickLocalizedText(content, "subtitle", locale)) ||
    "Visionary artist and weaver of soul‑story. Her work lives where Earth meets Ether— a devotion to beauty, breath, and belonging.";
  const bioTitle =
    (content && pickLocalizedText(content, "bio_title", locale)) ||
    t("profile.aLivingPrayer");
  const bioParagraphs = (content &&
    pickLocalizedJson(content, "bio_paragraphs", locale)) || [
    t("profile.fanahaIsAConduit"),
    t("profile.withVoiceAndBreath"),
    t("profile.ratherThanPerform"),
  ];

  const socials = content?.socials || {
    instagram: "https://instagram.com/fanaha7",
    instagram_enabled: false,
    youtube: "#",
    youtube_enabled: false,
    spotify: "#",
    spotify_enabled: false,
    facebook: "",
    facebook_enabled: false,
    email: "",
    email_enabled: false,
  };

  const pillars = (content &&
    pickLocalizedJson(content, "pillars", locale)) || [
    {
      title: t("profile.nature"),
      body: t("profile.earthAsMuse"),
    },
    {
      title: t("profile.feminineWisdom"),
      body: t("profile.artAsSanctuary"),
    },
    {
      title: "Ancestral Memory",
      body: "Songs and symbols that honor the ones before us, weaving lineage into modern ritual.",
    },
    {
      title: t("profile.transformation"),
      body: t("profile.transformationBody"),
    },
  ];

  const milestones = (content &&
    pickLocalizedJson(content, "milestones", locale)) || [
    {
      year: t("profile.origins"),
      text: t("profile.theFirstSpark"),
    },
    {
      year: t("profile.becoming"),
      text: t("profile.studyPilgrimageExperiment"),
    },
    {
      year: t("profile.offerings"),
      text: "Live performances, sound journeys, visual works, and intimate circles where art becomes a shared ceremony.",
    },
    {
      year: t("profile.now"),
      text: t("profile.portalsForRemembrance"),
    },
  ];

  const quote =
    (content && pickLocalizedText(content, "quote", locale)) ||
    "Art is how I remember what the body always knew— that love is a frequency, and presence is the doorway.";
  const quoteAuthor =
    (content && pickLocalizedText(content, "quote_author", locale)) ||
    "— Fanaha";

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
            {t("profile.pillarsOfPractice")}
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
            {t("profile.pathAndBecoming")}
          </h2>
          <p className="text-base sm:text-lg text-zinc-700 leading-loose tracking-wide px-4 sm:px-8 text-center mb-12">
            {t("profile.pathIntro")}
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
        {(socials.instagram_enabled ||
          socials.youtube_enabled ||
          socials.spotify_enabled ||
          socials.facebook_enabled ||
          socials.email_enabled) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="w-full text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl mb-8 tracking-wide">
              {t("nav.connect")}
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {socials.instagram_enabled && socials.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-full border-2 border-zinc-400 text-zinc-700 font-medium hover:bg-zinc-100 transition-colors tracking-wide"
                >
                  {t("nav.instagram")}
                </a>
              )}
              {socials.youtube_enabled && socials.youtube && (
                <a
                  href={socials.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-full border-2 border-zinc-400 text-zinc-700 font-medium hover:bg-zinc-100 transition-colors tracking-wide"
                >
                  YouTube
                </a>
              )}
              {socials.spotify_enabled && socials.spotify && (
                <a
                  href={socials.spotify}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-full border-2 border-zinc-400 text-zinc-700 font-medium hover:bg-zinc-100 transition-colors tracking-wide"
                >
                  Spotify
                </a>
              )}
              {socials.facebook_enabled && socials.facebook && (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-full border-2 border-zinc-400 text-zinc-700 font-medium hover:bg-zinc-100 transition-colors tracking-wide"
                >
                  {t("nav.facebook")}
                </a>
              )}
              {socials.email_enabled && socials.email && (
                <a
                  href={`mailto:${socials.email}`}
                  className="px-6 py-3 rounded-full border-2 border-zinc-400 text-zinc-700 font-medium hover:bg-zinc-100 transition-colors tracking-wide"
                >
                  {t("contact.email")}
                </a>
              )}
            </div>
          </motion.div>
        )}

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

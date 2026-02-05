"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FaInstagram, FaFacebookF, FaEnvelope } from "react-icons/fa";

export default function Footer({ footerContent }) {
  const pathname = usePathname();
  const showCta =
    pathname !== "/order" &&
    pathname !== "/en/order" &&
    pathname !== "/fr/order";
  const t = useTranslations();

  // Default content if not provided
  const title = footerContent?.title || t("order.commissionYourArt");
  const description =
    footerContent?.description || t("order.transformSacredSpace");

  return (
    <footer className="relative w-full bg-gradient-to-b from-transparent via-zinc-50 to-zinc-100 border-t border-black/10 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* CTA Section */}
        {showCta && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider mb-6">
                {title}
              </h2>
              <p className="text-base sm:text-lg text-black/80 leading-loose tracking-wide max-w-2xl mx-auto mb-8 px-4 whitespace-pre-line">
                {description}
              </p>
              <Link
                href="/order"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-bold tracking-widest transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="font-extrabold">{t("actions.getYours")}</span>
                <svg
                  className="w-5 h-5"
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
            </motion.div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-black/15 to-transparent mb-12"></div>
          </>
        )}

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center md:text-left"
          >
            <h3 className="text-2xl font-bold tracking-widest mb-3 text-black/90">
              {t("brand.name")}
            </h3>
            <p className="text-sm sm:text-[15px] text-black/75 leading-relaxed tracking-wide">
              {t("brand.tagline")}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <h4 className="text-sm font-semibold tracking-widest uppercase text-black/85 mb-4">
              {t("nav.explore")}
            </h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/alchemy"
                className="text-sm sm:text-[15px] text-black/70 hover:text-black/90 transition-colors tracking-wide"
              >
                {t("nav.alchemicalArt")}
              </Link>
              <Link
                href="/altar"
                className="text-sm sm:text-[15px] text-black/70 hover:text-black/90 transition-colors tracking-wide"
              >
                {t("nav.altarArtwork")}
              </Link>
              <Link
                href="/about"
                className="text-sm sm:text-[15px] text-black/70 hover:text-black/90 transition-colors tracking-wide"
              >
                {t("nav.about")}
              </Link>
              <Link
                href="/contact"
                className="text-sm sm:text-[15px] text-black/70 hover:text-black/90 transition-colors tracking-wide"
              >
                {t("nav.contact")}
              </Link>
            </nav>
          </motion.div>

          {/* Social Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center md:text-right"
          >
            <h4 className="text-sm font-semibold tracking-widest uppercase text-black/85 mb-4">
              {t("nav.connect")}
            </h4>
            <div className="flex justify-center md:justify-end gap-4">
              <a
                href="https://www.instagram.com/fanaha?utm_source=ig_web_button_share_sheet&igsh=MWpkYWdkeGVwcDMwMw=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-black/20 flex items-center justify-center text-black/70 hover:border-purple-400/70 hover:text-purple-700 transition-all duration-300 hover:scale-110"
                aria-label={t("nav.instagram")}
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/fanahacrea"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-black/20 flex items-center justify-center text-black/70 hover:border-purple-400/70 hover:text-purple-700 transition-all duration-300 hover:scale-110"
                aria-label={t("nav.facebook")}
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
              <Link
                href="/contact"
                className="w-10 h-10 rounded-full bg-white border border-black/20 flex items-center justify-center text-black/70 hover:border-purple-400/70 hover:text-purple-700 transition-all duration-300 hover:scale-110"
                aria-label={t("contact.email")}
              >
                <FaEnvelope className="w-5 h-5" />
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-black/65 mt-4 tracking-wide">
              fanahacrea@gmail.com
            </p>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-black/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-black/55">
            <p className="tracking-wide">
              {t("copyright.rightsReserved", {
                year: new Date().getFullYear(),
              })}
            </p>
            <p className="tracking-wide">{t("copyright.photosBy")}</p>
          </div>
          <p className="mt-3 text-center md:text-left text-xs sm:text-sm text-black/50 tracking-wide max-w-4xl mx-auto">
            {t("copyright.allArtworkProtected")}
          </p>
        </div>

        {/* Decorative Element */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-48 opacity-[0.035] pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-black/40"
            />
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-black/40"
            />
            <circle
              cx="50"
              cy="50"
              r="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-black/40"
            />
          </svg>
        </div>
      </div>
    </footer>
  );
}

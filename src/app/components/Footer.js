"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaInstagram, FaFacebookF, FaEnvelope } from "react-icons/fa";

export default function Footer({ footerContent }) {
  // Default content if not provided
  const title = footerContent?.title || "Commission Your Art";
  const description =
    footerContent?.description ||
    "Transform your sacred space with a custom alchemical art piece. Each creation is crafted with intention, infused with symbolism, and designed to resonate with your unique journey.";

  return (
    <footer className="relative w-full bg-gradient-to-b from-transparent via-zinc-50 to-zinc-100 border-t border-zinc-200 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* CTA Section */}
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
          <p className="text-base sm:text-lg text-zinc-700 leading-loose tracking-wide max-w-2xl mx-auto mb-8 px-4 whitespace-pre-line">
            {description}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-medium tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>Start Your Commission</span>
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
        <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent mb-12"></div>

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
            <h3 className="text-2xl font-bold tracking-widest mb-3">FANAHA</h3>
            <p className="text-sm text-zinc-600 leading-relaxed tracking-wide">
              Where art meets alchemy, and intention becomes form.
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
            <h4 className="text-sm font-semibold tracking-widest uppercase text-zinc-800 mb-4">
              Explore
            </h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/alchemy"
                className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors tracking-wide"
              >
                Alchemical Art
              </Link>
              <Link
                href="/altar"
                className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors tracking-wide"
              >
                Altar Artwork
              </Link>
              <Link
                href="/about"
                className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors tracking-wide"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors tracking-wide"
              >
                Contact
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
            <h4 className="text-sm font-semibold tracking-widest uppercase text-zinc-800 mb-4">
              Connect
            </h4>
            <div className="flex justify-center md:justify-end gap-4">
              <a
                href="https://www.instagram.com/fanaha?utm_source=ig_web_button_share_sheet&igsh=MWpkYWdkeGVwcDMwMw=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border-2 border-zinc-300 flex items-center justify-center text-zinc-700 hover:border-purple-400 hover:text-purple-600 transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/fanahacrea"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border-2 border-zinc-300 flex items-center justify-center text-zinc-700 hover:border-purple-400 hover:text-purple-600 transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
              <Link
                href="/contact"
                className="w-10 h-10 rounded-full bg-white border-2 border-zinc-300 flex items-center justify-center text-zinc-700 hover:border-purple-400 hover:text-purple-600 transition-all duration-300 hover:scale-110"
                aria-label="Email"
              >
                <FaEnvelope className="w-5 h-5" />
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-4 tracking-wide">
              fanahacrea@gmail.com
            </p>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
            <p className="tracking-wide">
              © {new Date().getFullYear()} Fanaha. All rights reserved.
            </p>
            <p className="tracking-wide">
              © Photos by Guðmann Þór Bjargmundsson
            </p>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-48 opacity-5 pointer-events-none">
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
          </svg>
        </div>
      </div>
    </footer>
  );
}

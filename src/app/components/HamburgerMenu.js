"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";
import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";

const MESSAGES = { en: enMessages, fr: frMessages };

function getMsg(locale, key) {
  const dict = MESSAGES[locale] || MESSAGES.en;
  const value = key.split(".").reduce((acc, part) => acc?.[part], dict);
  return typeof value === "string" ? value : key;
}

export default function HamburgerMenu({
  menuOpen,
  onMenuToggle,
  visualLocale,
  onVisualLocaleChange,
  onNavigateStart,
}) {
  const [orderClicked, setOrderClicked] = useState(false);
  const currentLocale = useLocale();
  // Only "preview" the pending locale while the menu is open.
  // Otherwise keep the UI consistent with the real route locale.
  const activeLocale =
    (menuOpen ? visualLocale : null) || currentLocale || "en";
  const customOrderText = getMsg(activeLocale, "order.customOrder");

  useEffect(() => {
    if (!orderClicked) return;
    const t = window.setTimeout(() => setOrderClicked(false), 3000);
    return () => window.clearTimeout(t);
  }, [orderClicked]);

  return (
    <motion.div
      className="fixed top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 z-[110] flex items-start sm:items-center justify-between sm:justify-end gap-3 pointer-events-none"
      initial={false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      <Link
        href="/order"
        locale={activeLocale}
        onPointerDown={() => setOrderClicked(true)}
        onClick={() => {
          setOrderClicked(true);
          onMenuToggle(false);
          if (typeof onNavigateStart === "function") onNavigateStart();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setOrderClicked(true);
            onMenuToggle(false);
            if (typeof onNavigateStart === "function") onNavigateStart();
          }
        }}
        aria-busy={orderClicked}
        className={`pointer-events-auto relative inline-flex items-center justify-center overflow-hidden rounded-full h-11 px-3 sm:px-4 text-xs sm:text-xs tracking-widest transition-all duration-300 transform hover:scale-[1.03] border ${
          menuOpen
            ? "bg-transparent text-white border-transparent shadow-none hover:bg-transparent hover:border-transparent"
            : "shadow-sm hover:shadow-md bg-white/80 text-[#191a2d] border-[#865c95]/35 hover:border-[#865c95]/55 hover:bg-white/90 sm:shadow-md sm:hover:shadow-lg sm:bg-[linear-gradient(135deg,#191a2d_0%,#2a254d_55%,#865c95_130%)] sm:hover:bg-[linear-gradient(135deg,#2a254d_0%,#191a2d_60%,#865c95_140%)] sm:text-white sm:border-[#865c95]/35 sm:hover:border-[#865c95]/60"
        }`}
        style={{
          fontFamily: "var(--font-house-minimalist), sans-serif",
          fontWeight: 700,
        }}
      >
        {/* click feedback (covers slow navigations) */}
        {orderClicked && !menuOpen && (
          <span className="pointer-events-none absolute inset-0">
            <span
              className={`absolute inset-0 opacity-30 animate-pulse ${
                menuOpen ? "bg-white/10" : "bg-black/5 sm:bg-white/10"
              }`}
            />
            <span
              className={`absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent ${
                menuOpen ? "via-white/25" : "via-black/10 sm:via-white/35"
              } to-transparent`}
            />
          </span>
        )}

        <span className={`relative ${orderClicked ? "opacity-95" : ""}`}>
          <span className="sm:hidden inline-flex flex-col items-center leading-none text-center">
            {(() => {
              const words = customOrderText.split(" ");
              const line1 = words.length >= 3 ? words.slice(0, 2).join(" ") : words[0] || "";
              const line2 = words.length >= 3 ? words.slice(2).join(" ") : words.slice(1).join(" ") || "";
              return (
                <>
                  {line1}
                  <br />
                  {line2}
                </>
              );
            })()}
          </span>
          <span className="hidden sm:inline">{customOrderText}</span>
        </span>
      </Link>

      {/* Right-side controls: mobile language pill + hamburger */}
      <div className="flex items-start sm:items-center gap-3">
        {/* Mobile-only: when menu open, put EN/FR left of X */}
        {menuOpen && (
          <div className="sm:hidden pointer-events-auto self-center">
            <LocaleSwitcher
              variant="menuMinimal"
              value={activeLocale}
              onChange={onVisualLocaleChange}
              deferNavigation
            />
          </div>
        )}

        <div className="relative pointer-events-auto">
          <motion.button
            className={`pointer-events-auto p-2.5 sm:p-3 rounded-full backdrop-blur-md border shadow-md hover:shadow-lg transition-all duration-300 group ${
              menuOpen
                ? "bg-black/90 border-white/15 hover:bg-black"
                : "bg-[linear-gradient(135deg,#191a2d_0%,#2a254d_65%)] border-[#865c95]/25 hover:bg-[linear-gradient(135deg,#2a254d_0%,#191a2d_70%)]"
            }`}
            onClick={() => onMenuToggle(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            initial={false}
            animate={{ rotate: menuOpen ? 180 : 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            whileHover={{
              scale: 1.03,
              borderColor: menuOpen
                ? "rgba(255, 255, 255, 0.25)"
                : "rgba(134, 92, 149, 0.6)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-4 h-3.5 sm:w-5 sm:h-4 flex flex-col justify-between relative">
              <motion.span
                className="block w-full h-[1.5px] sm:h-[1.5px] bg-white rounded-full origin-center"
                style={{
                  boxShadow: menuOpen ? "0 0 10px rgba(0, 0, 0, 0.35)" : "none",
                }}
                animate={{
                  rotate: menuOpen ? 45 : 0,
                  y: menuOpen ? 6 : 0,
                  // Keep the X the same color as the hamburger (white)
                  backgroundColor: "rgb(255, 255, 255)",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
              <motion.span
                className="block w-full h-[1.5px] sm:h-[1.5px] bg-white rounded-full"
                animate={{
                  opacity: menuOpen ? 0 : 1,
                  scale: menuOpen ? 0 : 1,
                  x: menuOpen ? 10 : 0,
                }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              />
              <motion.span
                className="block w-full h-[1.5px] sm:h-[1.5px] bg-white rounded-full origin-center"
                style={{
                  boxShadow: menuOpen ? "0 0 10px rgba(0, 0, 0, 0.35)" : "none",
                }}
                animate={{
                  rotate: menuOpen ? -45 : 0,
                  y: menuOpen ? -6 : 0,
                  // Keep the X the same color as the hamburger (white)
                  backgroundColor: "rgb(255, 255, 255)",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>

            {/* Subtle glow effect when menu is open */}
            {menuOpen && (
              <motion.div
                className="absolute inset-0 rounded-full blur-xl"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.35)" }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.5 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>

          {/* Desktop/tablet: keep minimal language toggle under the X */}
          {menuOpen && (
            <div className="hidden sm:flex absolute right-0 top-full mt-2 justify-end">
              <LocaleSwitcher
                variant="menuMinimal"
                value={activeLocale}
                onChange={onVisualLocaleChange}
                deferNavigation
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

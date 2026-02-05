"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";

const MESSAGES = { en: enMessages, fr: frMessages };

function getMsg(locale, key) {
  const dict = MESSAGES[locale] || MESSAGES.en;
  const value = key.split(".").reduce((acc, part) => acc?.[part], dict);
  return typeof value === "string" ? value : key;
}

export default function Menu({
  menuOpen,
  onMenuToggle,
  visualLocale,
  onNavigateStart,
}) {
  const currentLocale = useLocale();
  const activeLocale = visualLocale || currentLocale || "en";

  const handleNavStart = () => {
    if (typeof onNavigateStart === "function") onNavigateStart();
    onMenuToggle(false);
  };

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          key="menu-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 w-screen h-screen bg-black/80 z-[99] overflow-y-auto"
          onClick={() => onMenuToggle(false)}
          aria-modal="true"
          role="dialog"
        >
          {/* Centered content wrapper - Grid layout for equal distribution */}
          <div className="flex h-svh flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.35,
              }}
              className="bg-none rounded-3xl px-[clamp(20px,8vw,64px)] py-[clamp(10px,4vw,32px)] w-[clamp(220px,80vw,420px)] max-w-[96vw] text-white text-center flex flex-col items-center justify-center box-border"
              onClick={(e) => e.stopPropagation()}
            >
              <ul
                className="list-none p-0 m-0 w-full grid grid-rows-8"
                style={{ height: "100%" }}
              >
                {[
                  {
                    label: getMsg(activeLocale, "nav.alchemicalArtPieces"),
                    href: "/alchemy",
                  },
                  {
                    label: getMsg(activeLocale, "nav.altarArtwork"),
                    href: "/altar",
                  },
                  {
                    label: getMsg(activeLocale, "nav.bigScale"),
                    href: "/murals",
                  },
                  {
                    label: getMsg(activeLocale, "nav.exhibitions"),
                    href: "/exhibitions",
                  },
                  {
                    label: getMsg(activeLocale, "nav.oraclesProjects"),
                    href: "/oracles-projects",
                  },
                  {
                    label: getMsg(activeLocale, "nav.whatIOffer"),
                    href: "/what-i-offer",
                  },
                  {
                    label: getMsg(activeLocale, "nav.testimonials"),
                    href: "/reviews",
                  },
                  { label: getMsg(activeLocale, "nav.about"), href: "/about" },
                  {
                    label: getMsg(activeLocale, "nav.contact"),
                    href: "/contact",
                  },
                ].map((item, index) => (
                  <motion.li
                    key={item.href}
                    className="m-0 w-full flex justify-center items-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 24,
                      delay: 0.35 + index * 0.13,
                    }}
                  >
                    <Link
                      href={item.href}
                      locale={activeLocale}
                      className="w-full"
                      onClick={handleNavStart}
                    >
                      <motion.h2
                        className="text-white no-underline text-[clamp(18px,2.5vw,28px)] font-normal tracking-wide inline-block py-[clamp(8px,1vw,14px)] rounded-xl w-full outline-none touch-manipulation whitespace-nowrap overflow-hidden text-ellipsis text-center cursor-pointer relative z-[1] focus-visible:ring-2 focus-visible:ring-violet-300 transition-colors duration-200 ease-out hover:text-purple-100 hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] focus:text-amber-100 focus:drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                        tabIndex={0}
                        aria-label={item.label}
                        whileHover={{
                          scale: 1.08,
                          transition: {
                            type: "spring",
                            stiffness: 500,
                            damping: 15,
                          },
                        }}
                        whileFocus={{
                          scale: 1.08,
                          transition: {
                            type: "spring",
                            stiffness: 500,
                            damping: 15,
                          },
                        }}
                        onClick={handleNavStart}
                      >
                        {item.label}
                      </motion.h2>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

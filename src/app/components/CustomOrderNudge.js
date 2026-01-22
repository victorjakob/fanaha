"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "fanaha_custom_order_nudge_v1";

export default function CustomOrderNudge({
  menuOpen = false,
  delayMs = 12000,
  debugAlwaysShow = false,
}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const shouldBeEligible = useMemo(() => {
    if (!pathname) return false;
    if (pathname === "/") return false; // never on home page
    if (pathname === "/order") return false; // don't nudge on the destination page
    if (pathname.startsWith("/manage")) return false; // never in admin
    return true;
  }, [pathname]);

  useEffect(() => {
    if (!shouldBeEligible) return;
    if (menuOpen) return;
    if (typeof window === "undefined") return;

    if (!debugAlwaysShow) {
      const alreadySeen = window.localStorage.getItem(STORAGE_KEY);
      if (alreadySeen) return;
    }

    const timer = window.setTimeout(
      () => {
        setVisible(true);
      },
      debugAlwaysShow ? 0 : delayMs
    );

    return () => window.clearTimeout(timer);
  }, [shouldBeEligible, menuOpen, delayMs, debugAlwaysShow]);

  useEffect(() => {
    if (shouldBeEligible) return;
    setVisible(false);
  }, [shouldBeEligible]);

  const markSeenAndClose = () => {
    try {
      if (!debugAlwaysShow) window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore storage failures (private mode, etc.)
    }
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") markSeenAndClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && shouldBeEligible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="false"
          aria-label="Custom order prompt"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* subtle, non-invasive backdrop */}
          <button
            type="button"
            aria-label="Close"
            onMouseDown={markSeenAndClose}
            className="absolute inset-0 bg-black/10 backdrop-blur-[1.5px]"
          />

          <motion.div
            className="relative w-[min(92vw,540px)] rounded-3xl border border-violet-200/40 bg-white/90 shadow-[0_20px_90px_rgba(88,28,135,0.16)] backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* soft halo */}
            <div
              className="pointer-events-none absolute -inset-6 rounded-[32px] opacity-50"
              style={{
                background:
                  "radial-gradient(circle at 50% 40%, rgba(139,92,246,0.22) 0%, rgba(0,0,0,0) 55%)",
              }}
            />

            <button
              type="button"
              aria-label="Dismiss"
              onClick={markSeenAndClose}
              className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-black/60 transition hover:bg-black/5 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative px-6 py-6 sm:px-8 sm:py-7">
              <div className="text-center">
                <div
                  className="text-[clamp(22px,3vw,32px)] tracking-widest text-black/90"
                  style={{
                    fontFamily:
                      "var(--font-house-minimalist), var(--font-playfair), serif",
                    letterSpacing: "0.02em",
                    fontWeight: 700,
                  }}
                >
                  Custom order
                </div>
                <div className="mx-auto mt-3 h-px w-28 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
                <div
                  className="mt-2 text-[15px] sm:text-base leading-relaxed tracking-wide text-black/80"
                  style={{ fontFamily: "var(--font-nunito), sans-serif" }}
                >
                  Commission a piece crafted for your space, your story, and your
                  energy.
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/order"
                  onClick={markSeenAndClose}
                  className="inline-flex w-full max-w-[340px] items-center justify-center rounded-full border border-violet-300/70 bg-white px-6 py-3 text-base leading-snug tracking-widest text-black shadow-sm transition-all duration-300 hover:border-violet-400/80 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60 sm:w-auto"
                  style={{
                    fontFamily:
                      "var(--font-house-minimalist), var(--font-playfair), serif",
                    fontWeight: 700,
                  }}
                >
                  GET YOURS
                </Link>
                <button
                  type="button"
                  onClick={markSeenAndClose}
                  className="w-full max-w-[340px] rounded-full px-4 py-3 text-base leading-snug tracking-wide text-black/70 transition hover:text-black/90 hover:bg-violet-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/60 sm:w-auto"
                  style={{
                    fontFamily:
                      "var(--font-house-minimalist), var(--font-playfair), serif",
                    fontWeight: 600,
                  }}
                >
                  Not now
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


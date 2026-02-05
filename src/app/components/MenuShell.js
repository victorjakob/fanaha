"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import RippleOverlay from "./RippleOverlay";
import Menu from "./Menu";
import TopBar from "./TopBar";
import HamburgerMenu from "./HamburgerMenu";

const LOCALES = ["en", "fr"];

function stripLocalePrefix(pathname) {
  if (!pathname) return "/";
  const parts = pathname.split("/");
  const maybeLocale = parts[1];
  if (LOCALES.includes(maybeLocale)) {
    const rest = "/" + parts.slice(2).join("/");
    return rest === "/" ? "/" : rest.replace(/\/+$/, "");
  }
  return pathname;
}

export default function MenuShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [pendingLocale, setPendingLocale] = useState(locale);
  const isHome = pathname === "/" || pathname === "/en" || pathname === "/fr";
  const isComingSoon = pathname?.includes("/coming-soon");

  // Keep pending locale aligned after real navigation
  useEffect(() => {
    setPendingLocale(locale);
  }, [locale]);

  const closeNavigateTimerRef = useRef(null);
  const prevMenuOpenRef = useRef(menuOpen);
  const skipNextCloseLocaleNavRef = useRef(false);

  // If navigation happens for any reason, cancel pending close-navigation
  useEffect(() => {
    if (closeNavigateTimerRef.current) {
      window.clearTimeout(closeNavigateTimerRef.current);
      closeNavigateTimerRef.current = null;
    }
  }, [pathname, locale]);

  // Defer locale navigation until the user closes the menu (smooth UX)
  useEffect(() => {
    const wasOpen = prevMenuOpenRef.current;
    prevMenuOpenRef.current = menuOpen;

    if (wasOpen && !menuOpen && pendingLocale !== locale) {
      if (skipNextCloseLocaleNavRef.current) {
        skipNextCloseLocaleNavRef.current = false;
        return;
      }
      const rest = stripLocalePrefix(pathname);
      const nextHref =
        rest === "/" ? `/${pendingLocale}` : `/${pendingLocale}${rest}`;

      closeNavigateTimerRef.current = window.setTimeout(() => {
        router.push(nextHref);
      }, 260);
    }
  }, [menuOpen, pendingLocale, locale, pathname, router]);

  // Keep the coming soon page completely clean (no nav).
  if (isComingSoon) return null;

  return (
    <>
      {!menuOpen && isHome && (
        <RippleOverlay onOpenMenu={() => setMenuOpen(true)} />
      )}
      {!menuOpen && !isHome && (
        <TopBar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      )}
      {/* Hamburger menu - always visible (including on home so mobile users see it) */}
      <HamburgerMenu
        menuOpen={menuOpen}
        onMenuToggle={setMenuOpen}
        visualLocale={pendingLocale}
        onVisualLocaleChange={setPendingLocale}
        onNavigateStart={() => {
          skipNextCloseLocaleNavRef.current = true;
        }}
      />
      <Menu
        menuOpen={menuOpen}
        onMenuToggle={setMenuOpen}
        visualLocale={pendingLocale}
        onNavigateStart={() => {
          skipNextCloseLocaleNavRef.current = true;
        }}
      />
    </>
  );
}

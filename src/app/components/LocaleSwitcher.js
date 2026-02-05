"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import LanguageToggle from "./LanguageToggle";
import * as React from "react";

const LOCALES = ["en", "fr"];

function getPathWithoutLocale(pathname) {
  if (!pathname) return "/";
  const parts = pathname.split("/");
  const maybeLocale = parts[1];
  if (LOCALES.includes(maybeLocale)) {
    const rest = "/" + parts.slice(2).join("/");
    return rest === "/" ? "/" : rest.replace(/\/+$/, "");
  }
  return pathname;
}

export default function LocaleSwitcher({
  variant = "compact",
  value,
  onChange,
  deferNavigation = false,
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const otherLocale = locale === "fr" ? "en" : "fr";
  const router = useRouter();
  const restPath = getPathWithoutLocale(pathname);

  const href = restPath === "/" ? "/" : restPath;

  if (variant === "menuMinimal") {
    return (
      <MenuMinimalToggle
        locale={locale}
        href={href}
        router={router}
        value={value}
        onChange={onChange}
        deferNavigation={deferNavigation}
      />
    );
  }

  if (variant === "premium") {
    return (
      <LanguageToggle
        value={locale}
        onChange={(next) => {
          const nextHref = href === "/" ? `/${next}` : `/${next}${href}`;
          router.push(nextHref);
        }}
      />
    );
  }

  if (variant === "segmentedPill") {
    return <SegmentedPillToggle locale={locale} href={href} router={router} />;
  }

  if (variant === "segmented") {
    return (
      <div className="relative flex items-center rounded-full bg-[linear-gradient(135deg,#191a2d_0%,#2a254d_65%)] backdrop-blur-md border border-[#865c95]/25 shadow-md hover:shadow-lg transition-all duration-300 px-1 py-1">
        <div
          className="absolute top-1 bottom-1 w-[44px] rounded-full bg-white/10 transition-transform"
          style={{ transform: `translateX(${locale === "en" ? 0 : 44}px)` }}
        />
        <Link
          href={href}
          locale="en"
          className={`relative z-[1] w-[44px] h-7 sm:h-8 text-xs sm:text-sm tracking-widest leading-none rounded-full transition-colors ${
            locale === "en" ? "text-white" : "text-white/65 hover:text-white"
          }`}
          aria-label="EN"
        >
          EN
        </Link>
        <Link
          href={href}
          locale="fr"
          className={`relative z-[1] w-[44px] h-7 sm:h-8 text-xs sm:text-sm tracking-widest leading-none rounded-full transition-colors ${
            locale === "fr" ? "text-white" : "text-white/65 hover:text-white"
          }`}
          aria-label="FR"
        >
          FR
        </Link>
      </div>
    );
  }

  if (variant === "mobilePill") {
    // Mobile-only: match the "Custom Order" pill style.
    return (
      <Link
        href={href}
        locale={otherLocale}
        aria-label={`Language: ${otherLocale.toUpperCase()}`}
        className="pointer-events-auto relative inline-flex items-center justify-center overflow-hidden rounded-full px-5 py-1.5 sm:py-1.5 text-xs sm:text-xs tracking-widest shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.03] border bg-white/90 text-[#191a2d] border-[#865c95]/35 hover:border-[#865c95]/55 hover:bg-white sm:shadow-md sm:hover:shadow-lg sm:bg-[linear-gradient(135deg,#191a2d_0%,#2a254d_55%,#865c95_130%)] sm:hover:bg-[linear-gradient(135deg,#2a254d_0%,#191a2d_60%,#865c95_140%)] sm:text-white sm:border-[#865c95]/35 sm:hover:border-[#865c95]/60"
        style={{
          fontFamily: "var(--font-house-minimalist), sans-serif",
          fontWeight: 700,
        }}
      >
        {otherLocale.toUpperCase()}
      </Link>
    );
  }

  // compact circle button that flips locale
  return (
    <Link
      href={href}
      locale={otherLocale}
      aria-label={`Language: ${otherLocale.toUpperCase()}`}
      className="pointer-events-auto relative p-2.5 sm:p-3 rounded-full bg-[linear-gradient(135deg,#191a2d_0%,#2a254d_65%)] backdrop-blur-md border border-[#865c95]/25 shadow-md hover:shadow-lg hover:bg-[linear-gradient(135deg,#2a254d_0%,#191a2d_70%)] transition-all duration-300 flex items-center justify-center"
      style={{
        fontFamily: "var(--font-house-minimalist), sans-serif",
        fontWeight: 700,
        width: 44,
        height: 44,
      }}
    >
      <span className="relative text-xs sm:text-sm tracking-widest text-white leading-none">
        {otherLocale.toUpperCase()}
      </span>
    </Link>
  );
}

function MenuMinimalToggle({
  locale,
  href,
  router,
  value,
  onChange,
  deferNavigation = false,
}) {
  const controlledLocale = value ?? locale;
  const [visualLocale, setVisualLocale] = React.useState(controlledLocale);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setVisualLocale(controlledLocale);
  }, [controlledLocale]);

  const toggle = () => {
    const next = visualLocale === "fr" ? "en" : "fr";
    setVisualLocale(next);
    if (typeof onChange === "function") onChange(next);

    if (!deferNavigation) {
      startTransition(() => {
        const nextHref = href === "/" ? `/${next}` : `/${next}${href}`;
        router.push(nextHref);
      });
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle language"
      className={`pointer-events-auto select-none ${
        !deferNavigation && isPending ? "opacity-90" : "opacity-100"
      }`}
      style={{
        fontFamily: "var(--font-house-minimalist), sans-serif",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
      }}
    >
      <span
        className={`text-sm ${
          visualLocale === "en"
            ? "font-extrabold text-white"
            : "font-medium text-white/60"
        }`}
      >
        EN
      </span>
      <span className="text-sm text-white/50 mx-2">/</span>
      <span
        className={`text-sm ${
          visualLocale === "fr"
            ? "font-extrabold text-white"
            : "font-medium text-white/60"
        }`}
      >
        FR
      </span>
    </button>
  );
}

function SegmentedPillToggle({ locale, href, router }) {
  const segW = 44;
  const [visualLocale, setVisualLocale] = React.useState(locale);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setVisualLocale(locale);
  }, [locale]);

  const go = (next) => {
    if (next === locale) return;
    setVisualLocale(next); // animate immediately
    startTransition(() => {
      const nextHref = href === "/" ? `/${next}` : `/${next}${href}`;
      router.push(nextHref);
    });
  };

  return (
    <div
      className={`pointer-events-auto relative inline-flex items-center rounded-full border border-[#865c95]/35 bg-white/90 text-[#191a2d] shadow-sm hover:shadow-md transition-all duration-300 px-1 py-1 sm:bg-[linear-gradient(135deg,#191a2d_0%,#2a254d_55%,#865c95_130%)] sm:text-white ${
        isPending ? "opacity-95" : ""
      }`}
      style={{
        fontFamily: "var(--font-house-minimalist), sans-serif",
        fontWeight: 700,
        height: 40,
      }}
      aria-label="Language"
      role="group"
    >
      <div
        className="absolute left-1 top-1 bottom-1 w-[44px] rounded-full bg-black/10 sm:bg-white/15 transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(${visualLocale === "en" ? 0 : segW}px)`,
        }}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={() => go("en")}
        aria-label="English"
        aria-pressed={visualLocale === "en"}
        className={`relative z-[1] w-[44px] h-8 inline-flex items-center justify-center text-xs tracking-widest leading-none rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
          visualLocale === "en"
            ? "text-[#191a2d] sm:text-white"
            : "text-[#191a2d]/70 hover:text-[#191a2d] sm:text-white/70 sm:hover:text-white"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => go("fr")}
        aria-label="French"
        aria-pressed={visualLocale === "fr"}
        className={`relative z-[1] w-[44px] h-8 inline-flex items-center justify-center text-xs tracking-widest leading-none rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
          visualLocale === "fr"
            ? "text-[#191a2d] sm:text-white"
            : "text-[#191a2d]/70 hover:text-[#191a2d] sm:text-white/70 sm:hover:text-white"
        }`}
      >
        FR
      </button>
    </div>
  );
}

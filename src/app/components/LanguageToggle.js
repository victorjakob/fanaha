"use client";

import React from "react";
import { FR, GB } from "country-flag-icons/react/3x2";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function FlagCircle({ children, label }) {
  return (
    <div
      className={cx(
        "relative grid place-items-center",
        "w-8 h-8 rounded-full overflow-hidden",
        // subtle drop shadow for badge
        "shadow-[0_6px_14px_rgba(0,0,0,0.14),0_2px_4px_rgba(0,0,0,0.10)]"
      )}
      aria-hidden="true"
      title={label}
    >
      {/* Ensure SVG covers the circle fully */}
      <div className="absolute inset-0 [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
        {children}
      </div>
      {/* soft highlight ring */}
      <div className="absolute inset-0 rounded-full ring-1 ring-white/35" />
    </div>
  );
}

export default function LanguageToggle({ value, onChange, className }) {
  const next = value === "fr" ? "en" : "fr";
  const ariaLabel =
    next === "fr" ? "Switch language to French" : "Switch language to English";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => onChange(next)}
      className={cx(
        "pointer-events-auto select-none",
        "relative inline-flex items-center justify-center gap-3",
        "rounded-full px-4 py-2",
        // neumorphic surface
        "bg-zinc-100/90",
        "shadow-[0_10px_24px_rgba(0,0,0,0.10),_inset_0_1px_0_rgba(255,255,255,0.85),_inset_0_-10px_18px_rgba(0,0,0,0.05)]",
        // hover: a touch stronger, still soft
        "hover:shadow-[0_12px_28px_rgba(0,0,0,0.12),_inset_0_1px_0_rgba(255,255,255,0.90),_inset_0_-12px_20px_rgba(0,0,0,0.055)]",
        // active: pressed feel
        "active:translate-y-[0.5px] active:shadow-[0_8px_18px_rgba(0,0,0,0.10),_inset_0_2px_10px_rgba(0,0,0,0.08),_inset_0_1px_0_rgba(255,255,255,0.75)]",
        "transition-[box-shadow,transform,background-color] duration-200 ease-out",
        // focus ring
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        className
      )}
      style={{
        fontFamily: "var(--font-house-minimalist), sans-serif",
        fontWeight: 700,
      }}
    >
      {value === "en" ? (
        <>
          <FlagCircle label="United Kingdom">
            <GB />
          </FlagCircle>
          <span className="text-sm tracking-widest uppercase text-zinc-800">
            EN
          </span>
        </>
      ) : (
        <>
          <span className="text-sm tracking-widest uppercase text-zinc-800">
            FR
          </span>
          <FlagCircle label="France">
            <FR />
          </FlagCircle>
        </>
      )}
    </button>
  );
}

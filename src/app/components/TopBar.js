"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function TopBar({ menuOpen, setMenuOpen }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="pt-12 fixed top-0 left-0 w-full flex justify-center items-center z-50"
      style={{ height: 72, pointerEvents: "none" }}
    >
      <button
        className="backdrop-blur-md bg-white/30 hover:bg-white/50 shadow-xl transition p-1"
        style={{
          marginTop: 12,
          pointerEvents: "auto",
          outline: "none",
          border: "none",
          borderRadius: "50%",
          boxShadow:
            "0 4px 32px 0 rgba(120,120,255,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.08)",
          transition: "background 0.18s, box-shadow 0.18s, filter 0.18s",
          filter: menuOpen ? "brightness(0.95) blur(0.5px)" : "none",
        }}
        aria-label="Open menu"
        tabIndex={0}
        onClick={() => setMenuOpen(!menuOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setMenuOpen(!menuOpen);
        }}
      >
        <div
          className={`transition-all duration-700 ease-in-out ${
            isScrolled
              ? "w-12 h-12 sm:w-14 sm:h-14"
              : "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
          }`}
        >
          <Image
            src="/logo/logo-space-full.jpeg"
            alt="Logo"
            width={112}
            height={112}
            className="w-full h-full"
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              boxShadow: "0 0 16px 2px rgba(120,120,255,0.10)",
            }}
            draggable={false}
          />
        </div>
      </button>
    </header>
  );
}

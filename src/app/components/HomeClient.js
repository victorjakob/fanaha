"use client";

import { useState } from "react";
import Link from "next/link";
import BackgroundSlideshow from "../BackgroundSlideshow";
import Menu from "./Menu";
import Logo from "./Logo";
import { FaInstagram, FaFacebookF, FaEnvelope } from "react-icons/fa";

const desktopImages = [
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1747320931/_DSF6023_icbayl.jpg",
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1747320930/DSC_7319_nrc7sk.jpg",
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1747320921/DSC_6423_-_Copie_vjlfne.jpg",
];

const mobileImages = [
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1747320938/_DSF6014_p8wuil.jpg",
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1747320938/_DSF5490_b0pbme.jpg",
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1747320936/_DSF5960_rmhckm.jpg",
];

export default function HomeClient() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20"
      style={{
        width: "100%",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <BackgroundSlideshow
        desktopImages={desktopImages}
        mobileImages={mobileImages}
      />
      {/* Light overlay above images, behind logo */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255, 0.2) 0%, rgba(40,40,50,0.12) 40%, rgba(20,20,20,0.45) 80%, rgba(0,0,0,0.7) 100%)",
          zIndex: 5,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
      {/* Centered Logo with Framer Motion effect */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <Logo menuOpen={menuOpen} />
      </div>

      {/* Copyright Notice - Left on desktop, Right on mobile */}
      <div
        className="fixed bottom-6 left-auto right-2 sm:left-8 sm:right-auto pointer-events-none"
        style={{
          zIndex: 100,
        }}
      >
        <p className="text-white/60 text-xs sm:text-sm tracking-wide text-right sm:text-left">
          © Guðmann Þór Bjargmundsson
        </p>
      </div>

      {/* Social Media Icons */}
      <div
        className="fixed bottom-12 sm:bottom-8 right-2 sm:right-8"
        style={{
          zIndex: 100,
          pointerEvents: "auto",
        }}
      >
        <div className="flex gap-3 sm:gap-6">
          <a
            href="https://www.instagram.com/fanaha"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Instagram"
          >
            <FaInstagram className="w-6 h-6 sm:w-7 sm:h-7" />
          </a>
          <a
            href="https://www.facebook.com/fanahacrea"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Facebook"
          >
            <FaFacebookF className="w-6 h-6 sm:w-7 sm:h-7" />
          </a>
          <Link
            href="/contact"
            className="text-white/80 hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Contact"
          >
            <FaEnvelope className="w-6 h-6 sm:w-7 sm:h-7" />
          </Link>
        </div>
      </div>

      {/* Menu */}
      <Menu menuOpen={menuOpen} onMenuToggle={setMenuOpen} />
    </div>
  );
}

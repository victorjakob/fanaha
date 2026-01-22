"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import RippleOverlay from "./RippleOverlay";
import Menu from "./Menu";
import TopBar from "./TopBar";
import HamburgerMenu from "./HamburgerMenu";

export default function MenuShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      {!menuOpen && isHome && (
        <RippleOverlay onOpenMenu={() => setMenuOpen(true)} />
      )}
      {!menuOpen && !isHome && (
        <TopBar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      )}
      {/* Hamburger menu - always visible */}
      {!isHome && (
        <HamburgerMenu menuOpen={menuOpen} onMenuToggle={setMenuOpen} />
      )}
      <Menu menuOpen={menuOpen} onMenuToggle={setMenuOpen} />
    </>
  );
}

"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import RippleOverlay from "./RippleOverlay";
import Menu from "./Menu";
import TopBar from "./TopBar";

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
      <Menu menuOpen={menuOpen} onMenuToggle={setMenuOpen} />
    </>
  );
}

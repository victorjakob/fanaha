"use client";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function RippleOverlay({ onOpenMenu }) {
  const [ripples, setRipples] = useState([]);
  const [cursor, setCursor] = useState({ x: -100, y: -100 });
  const rippleId = useRef(0);

  function handleMouseMove(e) {
    const x = e.clientX;
    const y = e.clientY;
    setCursor({ x, y });
    const id = rippleId.current++;
    setRipples((prev) => [...prev, { id, x, y }]);
  }

  function handleRippleComplete(id) {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 98,
        cursor: "none",
      }}
      onClick={onOpenMenu}
      onMouseMove={handleMouseMove}
    >
      {/* Custom circle cursor */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: cursor.x,
          top: cursor.y,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "rgba(134, 92, 149, 0.85)",
          pointerEvents: "none",
          zIndex: 102,
          transform: "translate(-50%, -50%)",
        }}
      />
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          initial={{
            x: ripple.x - 50,
            y: ripple.y - 50,
            scale: 0.2,
            opacity: 0.45,
          }}
          animate={{
            scale: 1.5,
            opacity: 0,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(200,220,255,0.18) 0%, rgba(180,200,255,0.12) 60%, rgba(120,180,255,0.08) 100%)",
            border: "2px solid rgba(180,200,255,0.22)",
            pointerEvents: "none",
            zIndex: 101,
            boxShadow: "0 0 32px 8px rgba(120,180,255,0.08)",
            mixBlendMode: "lighten",
          }}
          onAnimationComplete={() => handleRippleComplete(ripple.id)}
        />
      ))}
    </div>
  );
}

"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

const MIN_DISTANCE = 36; // px the mouse must travel before a new ripple spawns
const MAX_RIPPLES = 15;

export default function RippleOverlay({ onOpenMenu }) {
  const [ripples, setRipples] = useState([]);
  const cursorRef = useRef(null);
  const rippleId = useRef(0);
  const lastRipple = useRef({ x: -9999, y: -9999 });
  const frame = useRef(0);
  const pos = useRef({ x: -100, y: -100 });

  function handleMouseMove(e) {
    const x = e.clientX;
    const y = e.clientY;
    pos.current = { x, y };

    // Move the custom cursor directly (no React re-render), once per frame
    if (!frame.current) {
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${pos.current.x - 10}px, ${pos.current.y - 10}px, 0)`;
        }
      });
    }

    // Only spawn a ripple after the mouse has travelled far enough
    const dx = x - lastRipple.current.x;
    const dy = y - lastRipple.current.y;
    if (dx * dx + dy * dy < MIN_DISTANCE * MIN_DISTANCE) return;
    lastRipple.current = { x, y };

    const id = rippleId.current++;
    setRipples((prev) => {
      const next = [...prev, { id, x, y }];
      return next.length > MAX_RIPPLES ? next.slice(-MAX_RIPPLES) : next;
    });
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
        ref={cursorRef}
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "rgba(134, 92, 149, 0.85)",
          pointerEvents: "none",
          zIndex: 102,
          transform: "translate3d(-100px, -100px, 0)",
          willChange: "transform",
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
            willChange: "transform, opacity",
          }}
          onAnimationComplete={() => handleRippleComplete(ripple.id)}
        />
      ))}
    </div>
  );
}

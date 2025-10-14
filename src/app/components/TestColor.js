"use client";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import { useEffect } from "react";

export default function TestColor() {
  const color = useMotionValue("#fff");
  const colorSpring = useSpring(color, { stiffness: 80, damping: 24 });

  useEffect(() => {
    setTimeout(() => {
      animate(color, "#a259f7", { duration: 2 });
    }, 1000);
  }, [color]);

  return (
    <motion.div
      style={{
        width: 200,
        height: 200,
        background: colorSpring,
      }}
    />
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";

export function Mark({ className = "h-11 w-11" }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden
      whileHover={reduce ? undefined : { scale: 1.06 }}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
    >
      <rect width="48" height="48" rx="12" fill="#1c1917" />
      <path d="M10 16.5c3.2-.8 7.2-.4 10 1.4 1.2.8 2 .8 2 .8V34s-.8 0-2-.7c-2.8-1.6-6.8-1.8-10-1.1V16.5z" fill="#f4efe6" />
      <path d="M38 16.5c-3.2-.8-7.2-.4-10 1.4-1.2.8-2 .8-2 .8V34s.8 0 2-.7c2.8-1.6 6.8-1.8 10-1.1V16.5z" fill="#f7f4ee" />
      <motion.rect
        x="23"
        y="15"
        width="2"
        height="20"
        rx="1"
        fill="#c2412a"
        animate={reduce ? undefined : { scaleY: [0.92, 1, 0.92] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "24px 25px" }}
      />
    </motion.svg>
  );
}

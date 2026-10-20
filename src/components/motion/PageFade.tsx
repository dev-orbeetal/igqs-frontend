"use client";

import { motion, useReducedMotion } from "framer-motion";

export function PageFade({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return children;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

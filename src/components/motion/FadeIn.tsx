"use client";

import { motion } from "framer-motion";

export function FadeIn({
  children,
  className,
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

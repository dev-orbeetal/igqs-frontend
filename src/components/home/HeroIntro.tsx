"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Link } from "@/i18n/navigation";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroIntro({
  kicker,
  title,
  subtitle,
  applyLabel,
  curriculumLabel,
}: {
  kicker: string;
  title?: string;
  subtitle?: string;
  applyLabel: string;
  curriculumLabel: string;
}) {
  const reduced = useReducedMotion();
  const item = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : 0.5, ease },
    },
  };

  return (
    <motion.div
      className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 pt-16 pb-24 sm:px-6"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: reduced ? 0 : 0.08 } } }}
    >
      <motion.p variants={item} className="eyebrow">
        {kicker}
      </motion.p>
      {title ? (
        <motion.h1
          variants={item}
          className="mt-4 max-w-3xl font-display text-4xl leading-[1.15] text-white sm:text-5xl lg:text-6xl"
        >
          {title}
        </motion.h1>
      ) : null}
      {subtitle ? (
        <motion.div variants={item}>
          <div className="heading-rule mt-5" />
          <p className="mt-5 max-w-xl text-base leading-relaxed text-igqs-cream/90 sm:text-lg">{subtitle}</p>
        </motion.div>
      ) : null}
      <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
        <Link href="/admission" className="btn-gold inline-flex">
          {applyLabel}
        </Link>
        <Link href="/curriculum" className="btn-gold-outline">
          {curriculumLabel}
        </Link>
      </motion.div>
    </motion.div>
  );
}

"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Award, GraduationCap, Sparkles, Users } from "lucide-react";
import { useEffect, useRef } from "react";

const ICONS = {
  users: Users,
  "graduation-cap": GraduationCap,
  award: Award,
  sparkles: Sparkles,
} as const;

export type Highlight = {
  id: number;
  value: string;
  label: string;
  icon: string;
};

function CountValue({ value }: { value: string }) {
  const reduced = useReducedMotion();
  const match = /^(\d+)(.*)$/.exec(value.trim());
  const target = match ? Number(match[1]) : null;
  const suffix = match?.[2] ?? "";
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) =>
    target === null ? value : `${Math.round(latest)}${suffix}`
  );

  useEffect(() => {
    if (target === null || !inView) return;
    if (reduced) {
      motionValue.set(target);
      return;
    }
    const controls = animate(motionValue, target, { duration: 1.1, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, motionValue, reduced, target]);

  if (target === null) return <span>{value}</span>;
  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function Highlights({ items, label }: { items: Highlight[]; label: string }) {
  const reduced = useReducedMotion();
  if (!items.length) return null;

  return (
    <section
      className="border-y border-igqs-gold bg-igqs-forest text-igqs-cream dark:bg-[#0b241c]"
      aria-label={label}
    >
      <h2 className="sr-only">{label}</h2>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-4 py-8 sm:px-6 md:grid-cols-4">
        {items.map((item, index) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS] ?? Users;
          return (
            <div key={item.id} className="flex flex-col items-center px-3 text-center">
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : index * 0.08 }}
              >
                <Icon className="size-8 text-igqs-gold" strokeWidth={1.5} aria-hidden />
              </motion.div>
              <p className="mt-2 font-display text-4xl leading-none text-igqs-gold">
                <CountValue value={item.value} />
              </p>
              <p className="mt-1.5 text-sm text-igqs-cream/80">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

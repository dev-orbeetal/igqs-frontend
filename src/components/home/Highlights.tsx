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

function CountValue({ value, delay = 0 }: { value: string; delay?: number }) {
  const reduced = useReducedMotion();
  const match = /^(\d+)(.*)$/.exec(value.trim());
  const target = match ? Number(match[1]) : null;
  const suffix = match?.[2] ?? "";
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  // Starts at the real figure so the server-rendered HTML shows the actual
  // number — it used to render "0" and only reach the real value once JS ran.
  const motionValue = useMotionValue(target ?? 0);
  const rounded = useTransform(motionValue, (latest) =>
    target === null ? value : `${Math.round(latest)}${suffix}`
  );
  const counted = useRef(false);

  useEffect(() => {
    if (target === null || !inView || counted.current) return;
    counted.current = true;
    if (reduced) {
      motionValue.set(target);
      return;
    }
    motionValue.set(0);
    const controls = animate(motionValue, target, {
      duration: 0.8,
      delay,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [delay, inView, motionValue, reduced, target]);

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
              {/* CSS reveal: the previous motion.div server-rendered at
                  opacity:0, so these icons were invisible until hydration. */}
              <div
                className="reveal"
                style={{ "--reveal-index": Math.min(index, 4) } as React.CSSProperties}
              >
                <Icon className="size-8 text-igqs-gold" strokeWidth={1.5} aria-hidden />
              </div>
              <p className="mt-2 font-display text-4xl leading-none text-igqs-gold">
                <CountValue value={item.value} delay={index * 0.08} />
              </p>
              <p className="mt-1.5 text-sm text-igqs-cream/80">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

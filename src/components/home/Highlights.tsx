"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Award, GraduationCap, Sparkles, Users } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useRef } from "react";
import { ArchCorner } from "@/components/ui/Ornaments";

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

const BENGALI_DIGITS = "০১২৩৪৫৬৭৮৯";
const NUMBER = /^([^0-9০-৯]*)([0-9০-৯][0-9০-৯,]*(?:\.[0-9০-৯]+)?)([\s\S]*)$/;

/**
 * Figures are typed into the CMS once, usually with English digits, and
 * shared by both languages — so the Bangla site rewrites them in Bengali
 * digits ("600+" → "৬০০+").
 */
function localizeDigits(value: string, locale: string) {
  if (locale !== "bn") return value;
  return value.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[Number(digit)]);
}

/**
 * Splits "1,200+" / "৳৫০০" / "98.5%" into prefix, number and suffix.
 * Bengali digits are read as numbers and written back as Bengali digits,
 * and thousands separators / decimal places are kept as authored.
 */
function parseCount(value: string) {
  const match = NUMBER.exec(value.trim());
  if (!match) return null;
  const [, prefix, raw, suffix] = match;
  const ascii = raw.replace(/[০-৯]/g, (digit) => String(BENGALI_DIGITS.indexOf(digit))).replace(/,/g, "");
  const target = Number(ascii);
  if (!Number.isFinite(target)) return null;
  const decimals = ascii.split(".")[1]?.length ?? 0;
  const formatter = new Intl.NumberFormat(/[০-৯]/.test(raw) ? "bn-BD" : "en-US", {
    useGrouping: raw.includes(","),
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return { prefix, suffix, target, format: (n: number) => formatter.format(n) };
}

function CountValue({ value: authored, delay = 0 }: { value: string; delay?: number }) {
  const locale = useLocale();
  const value = localizeDigits(authored, locale);
  const reduced = useReducedMotion();
  const parsed = useMemo(() => parseCount(value), [value]);
  const target = parsed?.target ?? null;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  // Starts at the real figure so the server-rendered HTML shows the actual
  // number — it used to render "0" and only reach the real value once JS ran.
  const motionValue = useMotionValue(target ?? 0);
  const display = useTransform(motionValue, (latest) => {
    // The resting value is always the authored string, verbatim.
    if (!parsed || latest >= parsed.target) return value;
    return `${parsed.prefix}${parsed.format(latest)}${parsed.suffix}`;
  });
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
      duration: 1.6,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [delay, inView, motionValue, reduced, target]);

  if (target === null) return <span>{value}</span>;
  return <motion.span ref={ref}>{display}</motion.span>;
}

export function Highlights({ items, label }: { items: Highlight[]; label: string }) {
  if (!items.length) return null;

  return (
    <section
      id="highlights"
      className="band-green relative scroll-mt-28 overflow-hidden border-t border-t-igqs-gold/60"
      aria-label={label}
    >
      <ArchCorner id="stats-arch-left" side="left" />
      <ArchCorner id="stats-arch-right" side="right" />
      <h2 className="sr-only">{label}</h2>
      <div className="relative mx-auto grid max-w-5xl grid-cols-2 gap-y-5 px-4 py-5 sm:px-6 sm:py-7 md:grid-cols-4 md:gap-y-0 md:[&>*+*]:border-l md:[&>*+*]:border-white/15">
        {items.map((item, index) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS] ?? Users;
          return (
            <div key={item.id} className="group flex flex-col items-center px-3 text-center">
              {/* CSS reveal: the previous motion.div server-rendered at
                  opacity:0, so these icons were invisible until hydration. */}
              <div
                className="reveal"
                data-reveal="pop"
                // RevealObserver may tag this before the component hydrates.
                suppressHydrationWarning
              >
                <span className="stat-icon stat-tile">
                  <Icon className="relative size-5 text-igqs-gold-soft sm:size-6" strokeWidth={1.6} aria-hidden />
                </span>
              </div>
              {/* leading-none! — the Bangla site's `.font-bn .font-display` rule
                  sets line-height 1.6, which made each figure a tall box. */}
              <p className="stat-number mt-2 text-[1.7rem] leading-none! text-igqs-gold tabular-nums sm:text-[2.1rem]">
                <CountValue value={item.value} delay={index * 0.08} />
              </p>
              <p className="mt-1.5 text-[0.8rem] leading-snug font-medium text-white/90 sm:text-[0.95rem]">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

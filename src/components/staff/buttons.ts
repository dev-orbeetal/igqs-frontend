const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-igqs-gold";

const base =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";

export const btn = {
  primary: `${base} bg-igqs-green text-igqs-cream shadow-sm hover:bg-[#146047] active:bg-[#0c3d2c] dark:bg-igqs-gold dark:text-igqs-ink dark:hover:bg-[#d4b56e] dark:active:bg-[#b8954a] ${focus}`,
  secondary: `${base} border border-igqs-gold/70 bg-white text-igqs-ink hover:border-igqs-gold hover:bg-igqs-gold/15 active:bg-igqs-gold/25 dark:border-igqs-gold/50 dark:bg-[#10261e] dark:text-igqs-sand dark:hover:bg-igqs-gold/15 ${focus}`,
  danger: `${base} border border-red-600/60 bg-white text-red-700 hover:bg-red-50 active:bg-red-100 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-950/50 ${focus}`,
};

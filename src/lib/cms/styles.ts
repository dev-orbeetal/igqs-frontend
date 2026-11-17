// border-igqs-gold/40 measured 1.39:1 against white — a field you cannot see
// the edge of. border-strong is the same hue at 3.95:1, matching the public
// site's form fields; gold/70 is 3.97:1 on the dark field background.
const fieldBase =
  "mt-1.5 w-full min-h-11 rounded-xl border bg-white px-3.5 py-2.5 text-sm text-igqs-ink shadow-sm outline-none transition placeholder:text-igqs-muted/80 focus:ring-2 focus:ring-igqs-gold/30 dark:bg-[#10261e] dark:text-igqs-sand";

export const fieldClass = `${fieldBase} border-igqs-border-strong focus:border-igqs-gold dark:border-igqs-gold/70`;

export const fieldClassInvalid = `${fieldBase} border-red-600 focus:border-red-600 dark:border-red-400`;

export function fieldClassFor(invalid?: boolean) {
  return invalid ? fieldClassInvalid : fieldClass;
}

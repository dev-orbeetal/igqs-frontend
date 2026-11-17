export const fieldClass =
  "mt-1.5 w-full min-h-12 rounded-2xl border border-igqs-border-strong bg-white px-4 py-3 text-base dark:border-igqs-gold/70 dark:bg-[#0d1f18]";

export function controlClass(invalid?: boolean) {
  return invalid ? `${fieldClass} !border-red-500 ring-1 ring-red-500` : fieldClass;
}

export const fieldErrorClass = "message-in mt-1 text-sm text-red-700 dark:text-red-300";

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { WhatsAppIcon } from "@/components/icons/Social";

/** Fixed chat button. Hidden when the school has no WhatsApp link. */
export function WhatsAppFloat({ href }: { href?: string | null }) {
  const url = href?.trim();
  const t = useTranslations("common");
  const [lift, setLift] = useState(0);

  useEffect(() => {
    if (!url) return;
    const update = () => {
      const bar = document.querySelector("[data-sticky-actions]");
      if (!bar) {
        setLift(0);
        return;
      }
      const rect = bar.getBoundingClientRect();
      const zoneTop = window.innerHeight - 96;
      if (rect.top < window.innerHeight && rect.bottom > zoneTop) {
        setLift(Math.ceil(window.innerHeight - rect.top + 16));
      } else {
        setLift(0);
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [url]);

  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp")}
      className="whatsapp-float motion-control print:hidden"
      style={lift ? { bottom: lift } : undefined}
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { apiUrl, type ApplicationDetail } from "@/lib/api";
import { PaymentStatusStep } from "@/components/admission/PaymentStatusStep";


export function SuccessPanel() {
  const t = useTranslations("admission");
  const locale = useLocale();
  const params = useSearchParams();
  const id = params.get("id");
  const [data, setData] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [failed, setFailed] = useState(!id);

  useEffect(() => {
    if (!id) return;
    fetch(apiUrl(`/api/admissions/applications/${encodeURIComponent(id)}/`, locale), {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("not found"))))
      .then((payload) => {
        setData(payload);
        setFailed(false);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [id, locale]);

  const statusKey = loading ? "loading" : failed ? "error" : (data?.status ?? "empty");

  return (
    <div>
      <div key={statusKey} className="fade-status">
        <PaymentStatusStep data={data} processing={loading} error={failed} />
      </div>
      <p className="mt-6 text-center text-sm text-igqs-muted print:hidden">
        {t("lostReceiptHint")}{" "}
        <Link href="/admission/receipt" className="motion-micro text-igqs-forest underline hover:text-igqs-green dark:text-igqs-gold dark:hover:text-igqs-gold-soft">
          {t("downloadPageTitle")}
        </Link>
      </p>
    </div>
  );
}

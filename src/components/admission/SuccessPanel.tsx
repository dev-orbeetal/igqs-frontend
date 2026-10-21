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

  return (
    <div>
      <PaymentStatusStep data={data} processing={loading} error={failed} />
      <p className="mt-6 text-center text-sm text-igqs-muted print:hidden">
        {t("lostReceiptHint")}{" "}
        <Link href="/admission/receipt" className="text-igqs-forest underline dark:text-igqs-gold">
          {t("downloadPageTitle")}
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiUrl } from "@/lib/api";
import {
  ApplicationReceiptCard,
  type ApplicationDetail,
} from "@/components/admission/ApplicationReceiptCard";

function normalizeLookupId(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function ReceiptLookupPanel() {
  const t = useTranslations("admission");
  const locale = useLocale();
  const params = useSearchParams();
  const preset = params.get("rid") ?? params.get("id") ?? "";
  const [query, setQuery] = useState(preset);
  const [data, setData] = useState<ApplicationDetail | null>(null);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  async function search(raw = query) {
    const lookupId = normalizeLookupId(raw);
    if (!lookupId) {
      setError(t("enterLookupId"));
      setData(null);
      return;
    }
    setSearching(true);
    setError("");
    try {
      const res = await fetch(
        apiUrl(`/api/admissions/lookup/?q=${encodeURIComponent(lookupId)}`, locale),
        { cache: "no-store" }
      );
      if (res.status === 404) {
        setData(null);
        setError(t("receiptNotFound"));
        return;
      }
      if (!res.ok) {
        setData(null);
        setError(t("receiptSearchError"));
        return;
      }
      setData((await res.json()) as ApplicationDetail);
    } catch {
      setData(null);
      setError(t("receiptSearchError"));
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    if (!preset) return;
    setQuery(preset);
    void search(preset);
    // Search once when a receipt ID is present in the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, locale]);

  return (
    <div className="space-y-8">
      <form
        className="rounded-3xl border border-igqs-gold/30 bg-white p-6 print:hidden dark:bg-[#0d1f18] sm:p-8"
        onSubmit={(event) => {
          event.preventDefault();
          void search();
        }}
      >
        <label className="block text-sm">
          {t("enterLookupId")}
          <input
            className="mt-2 w-full min-h-12 rounded-xl border border-igqs-border-strong bg-white px-3 py-2 font-mono dark:border-igqs-gold/70 dark:bg-[#10261e]"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("lookupPlaceholder")}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <button
          type="submit"
          disabled={searching}
          className="mt-5 rounded-full bg-igqs-green px-6 py-2.5 text-sm text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
        >
          {searching ? t("searchingReceipt") : t("searchReceipt")}
        </button>
        <p role="status" aria-live="polite" className="mt-4 text-sm text-red-700 empty:mt-0">
          {error}
        </p>
      </form>

      {data && (
        <ApplicationReceiptCard
          data={data}
          kicker={t("downloadPageTitle")}
          heading={t("viewReceipt")}
          showPrint
          showViewPdf
        />
      )}
    </div>
  );
}

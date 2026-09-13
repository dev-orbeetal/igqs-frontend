"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { staffDownload, staffRequest, type StaffApplicationListItem } from "@/lib/staff";

const fieldClass =
  "mt-1 w-full rounded-xl border border-igqs-gold/30 bg-transparent px-3 py-2 text-sm";

function statusClass(status: string) {
  if (status === "approved") return "text-emerald-700 dark:text-emerald-300";
  if (status === "rejected") return "text-red-700 dark:text-red-300";
  return "text-amber-700 dark:text-amber-300";
}

export function StaffApplicationList() {
  const t = useTranslations("staff");
  const ta = useTranslations("admission");
  const locale = useLocale();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [applyingClass, setApplyingClass] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("-created_at");
  const [classes, setClasses] = useState<string[]>([]);
  const [rows, setRows] = useState<StaffApplicationListItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    if (applyingClass) params.set("applying_class", applyingClass);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    if (sort) params.set("sort", sort);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [q, status, applyingClass, dateFrom, dateTo, sort]);

  useEffect(() => {
    setLoading(true);
    staffRequest<{
      count: number;
      results: StaffApplicationListItem[];
      classes: string[];
    }>(`/api/admissions/staff/applications/${query}`)
      .then((data) => {
        setRows(data.results);
        setCount(data.count);
        setClasses(data.classes);
      })
      .catch(() => {
        setRows([]);
        setCount(0);
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-igqs-gold">{t("kicker")}</p>
          <h1 className="mt-2 font-display text-4xl">{t("applications")}</h1>
          <p className="mt-2 text-sm text-igqs-muted">{t("searchHint")}</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-igqs-gold/40 px-4 py-2 text-sm"
          onClick={() => staffDownload(`/api/admissions/staff/applications/export/${query}`, "igqs-applications.csv")}
        >
          {t("downloadList")}
        </button>
      </div>

      <form className="mt-8 grid gap-3 rounded-3xl border border-igqs-gold/25 bg-white p-5 dark:bg-[#0d1f18] md:grid-cols-4">
        <label className="text-sm md:col-span-2">
          {t("search")}
          <input
            className={fieldClass}
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={t("searchPlaceholder")}
          />
        </label>
        <label className="text-sm">
          {t("status")}
          <select className={fieldClass} value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">{t("allStatuses")}</option>
            <option value="pending">{ta("pending")}</option>
            <option value="approved">{ta("approved")}</option>
            <option value="rejected">{ta("rejected")}</option>
          </select>
        </label>
        <label className="text-sm">
          {t("applyingClass")}
          <select className={fieldClass} value={applyingClass} onChange={(event) => setApplyingClass(event.target.value)}>
            <option value="">{t("allClasses")}</option>
            {classes.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          {t("dateFrom")}
          <input
            type="date"
            className={fieldClass}
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
          />
        </label>
        <label className="text-sm">
          {t("dateTo")}
          <input
            type="date"
            className={fieldClass}
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
          />
        </label>
        <label className="text-sm md:col-span-2">
          {t("sort")}
          <select className={fieldClass} value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="-created_at">{t("sortNewest")}</option>
            <option value="created_at">{t("sortOldest")}</option>
            <option value="student_name">{t("sortName")}</option>
            <option value="applying_class">{t("sortClass")}</option>
            <option value="-payment_amount">{t("sortFee")}</option>
            <option value="status">{t("sortStatus")}</option>
          </select>
        </label>
      </form>

      <p className="mt-4 text-sm text-igqs-muted">
        {loading ? t("loading") : t("resultCount", { count })}
      </p>

      <div className="mt-4 space-y-3 md:hidden">
        {rows.map((row) => (
          <article key={row.application_id} className="rounded-3xl border border-igqs-gold/25 bg-white p-4 dark:bg-[#0d1f18]">
            <p className="font-mono text-xs text-igqs-gold">{row.application_id}</p>
            <h2 className="mt-1 font-display text-2xl">{row.student_name}</h2>
            <p className="mt-1 text-sm text-igqs-muted">{row.guardian_name} · {row.applying_class}</p>
            <p className="mt-2 text-sm">
              BDT {Number(row.payment_amount).toLocaleString(locale === "bn" ? "bn-BD" : "en-GB")}
            </p>
            <p className={`mt-2 text-sm ${statusClass(row.status)}`}>
              {row.status === "approved" ? ta("approved") : row.status === "rejected" ? ta("rejected") : ta("pending")}
            </p>
            <p className="mt-1 text-xs text-igqs-muted">
              {new Date(row.created_at).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB")}
            </p>
            <Link href={`/staff/applications/${row.application_id}`} className="mt-3 inline-block text-sm text-igqs-gold underline">
              {t("review")}
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-4 hidden overflow-x-auto rounded-3xl border border-igqs-gold/25 bg-white dark:bg-[#0d1f18] md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-igqs-gold/20 text-xs uppercase tracking-[0.12em] text-igqs-gold">
            <tr>
              <th className="px-4 py-3">{t("student")}</th>
              <th className="px-4 py-3">{t("applyingClass")}</th>
              <th className="px-4 py-3">{t("amount")}</th>
              <th className="px-4 py-3">{t("status")}</th>
              <th className="px-4 py-3">{t("date")}</th>
              <th className="px-4 py-3">{t("action")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.application_id}
                className="cursor-pointer border-t border-igqs-gold/10 hover:bg-igqs-sand/30 dark:hover:bg-white/5"
                onClick={() => router.push(`/staff/applications/${row.application_id}`)}
              >
                <td className="px-4 py-3">
                  {row.student_name}
                  <div className="text-igqs-muted">{row.mobile}</div>
                  <div className="font-mono text-xs text-igqs-gold">{row.application_id}</div>
                </td>
                <td className="px-4 py-3">{row.applying_class}</td>
                <td className="px-4 py-3">
                  BDT {Number(row.payment_amount).toLocaleString(locale === "bn" ? "bn-BD" : "en-GB")}
                </td>
                <td className={`px-4 py-3 ${statusClass(row.status)}`}>
                  {row.status === "approved" ? ta("approved") : row.status === "rejected" ? ta("rejected") : ta("pending")}
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(row.created_at).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/staff/applications/${row.application_id}`}
                    className="text-igqs-gold underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {t("review")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-igqs-muted">{t("noApplications")}</p>
        )}
      </div>
      {!loading && rows.length === 0 && (
        <p className="mt-6 text-center text-sm text-igqs-muted md:hidden">{t("noApplications")}</p>
      )}
    </div>
  );
}

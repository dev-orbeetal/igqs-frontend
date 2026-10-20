"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/staff/StatusBadge";
import { btn } from "@/components/staff/buttons";
import { Link, useRouter } from "@/i18n/navigation";
import { fieldClass } from "@/lib/cms";
import { formatMoney, staffDownload, staffRequest, type StaffApplicationListItem } from "@/lib/staff";

function applicationStatus(status: string, t: (key: "approved" | "rejected" | "pending") => string) {
  if (status === "approved") return t("approved");
  if (status === "rejected") return t("rejected");
  return t("pending");
}

const FIRST_SORT: Record<string, string> = {
  created_at: "-created_at",
  student_name: "student_name",
  applying_class: "applying_class",
  payment_amount: "-payment_amount",
  status: "status",
};

function SortHeader({
  label,
  field,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  field: string;
  sort: string;
  onSort: (field: string) => void;
  align?: "left" | "right";
}) {
  const active = sort === field || sort === `-${field}`;
  const descending = sort === `-${field}`;
  return (
    <th className={`px-4 py-3 ${align === "right" ? "text-right" : ""}`} aria-sort={active ? (descending ? "descending" : "ascending") : "none"}>
      <button
        type="button"
        className={`inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-igqs-label ${align === "right" ? "ml-auto" : ""}`}
        onClick={() => onSort(field)}
      >
        {label}
        <span className={active ? "text-igqs-green dark:text-igqs-gold-soft" : "text-igqs-label/70"} aria-hidden>
          {active ? (descending ? "↓" : "↑") : "↕"}
        </span>
      </button>
    </th>
  );
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
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadTick, setReloadTick] = useState(0);
  const pageSize = 25;
  const pageCount = Math.max(1, Math.ceil(count / pageSize));

  const filters = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    if (applyingClass) params.set("applying_class", applyingClass);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    if (sort) params.set("sort", sort);
    return params.toString();
  }, [q, status, applyingClass, dateFrom, dateTo, sort]);

  // Any filter change invalidates the current page.
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const query = useMemo(() => {
    const params = new URLSearchParams(filters);
    params.set("page", String(page));
    params.set("page_size", String(pageSize));
    return `?${params.toString()}`;
  }, [filters, page]);

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
        setLoadError(false);
      })
      .catch((err) => {
        if (err instanceof Error && err.message === "unauthorized") {
          router.replace("/login");
          return;
        }
        setRows([]);
        setCount(0);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [query, router, reloadTick]);

  function onSort(field: string) {
    if (sort === field || sort === `-${field}`) {
      setSort(sort.startsWith("-") ? field : `-${field}`);
      return;
    }
    setSort(FIRST_SORT[field] ?? field);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-2xl text-sm text-igqs-muted">{t("searchHint")}</p>
        <button
          type="button"
          className={btn.secondary}
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
        <label className="text-sm md:col-span-2 md:hidden">
          {t("sort")}
          <select className={fieldClass} value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="-created_at">{t("sortNewest")}</option>
            <option value="created_at">{t("sortOldest")}</option>
            <option value="student_name">{t("sortName")}</option>
            <option value="-student_name">{t("sortNameDesc")}</option>
            <option value="applying_class">{t("sortClass")}</option>
            <option value="-applying_class">{t("sortClassDesc")}</option>
            <option value="-payment_amount">{t("sortFee")}</option>
            <option value="payment_amount">{t("sortFeeLow")}</option>
            <option value="status">{t("sortStatus")}</option>
            <option value="-status">{t("sortStatusDone")}</option>
          </select>
        </label>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="text-sm text-igqs-muted">
          {loading ? t("loading") : t("resultCount", { count })}
        </p>
        {!loading && count > pageSize && (
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              className={btn.secondary}
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              {t("previousPage")}
            </button>
            <span className="text-igqs-muted">{t("pageOf", { page, pageCount })}</span>
            <button
              type="button"
              className={btn.secondary}
              disabled={page >= pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            >
              {t("nextPage")}
            </button>
          </div>
        )}
      </div>

      {loadError && (
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {t("loadError")}
          <button type="button" className="font-semibold underline" onClick={() => setReloadTick((value) => value + 1)}>
            {t("retry")}
          </button>
        </div>
      )}

      <div className="mt-4 space-y-3 md:hidden">
        {rows.map((row) => (
          <article key={row.application_id} className="rounded-3xl border border-igqs-gold/25 bg-white p-4 dark:bg-[#0d1f18]">
            <p className="font-mono text-xs text-igqs-label">{row.application_id}</p>
            <h2 className="mt-1 font-display text-2xl">{row.student_name}</h2>
            <p className="mt-1 text-sm text-igqs-muted">{row.guardian_name} · {row.applying_class}</p>
            <p className="mt-2 text-sm">{formatMoney(row.payment_amount, locale)}</p>
            <div className="mt-2">
              <StatusBadge status={row.status} label={applicationStatus(row.status, ta)} />
            </div>
            <p className="mt-1 text-xs text-igqs-muted">
              {new Date(row.created_at).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB")}
            </p>
            <Link href={`/payments/applications/${row.application_id}`} className={`mt-3 ${btn.secondary}`}>
              {t("review")}
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-4 hidden overflow-x-auto rounded-3xl border border-igqs-gold/25 bg-white dark:bg-[#0d1f18] md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-igqs-gold/20 text-xs uppercase tracking-[0.12em] text-igqs-label">
            <tr>
              <SortHeader label={t("student")} field="student_name" sort={sort} onSort={onSort} />
              <SortHeader label={t("applyingClass")} field="applying_class" sort={sort} onSort={onSort} />
              <SortHeader label={t("amount")} field="payment_amount" sort={sort} onSort={onSort} />
              <SortHeader label={t("status")} field="status" sort={sort} onSort={onSort} />
              <SortHeader label={t("date")} field="created_at" sort={sort} onSort={onSort} />
              <th className="px-4 py-3 text-right">{t("action")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.application_id}
                className="cursor-pointer border-t border-igqs-gold/10 hover:bg-igqs-sand/30 dark:hover:bg-white/5"
                onClick={() => router.push(`/payments/applications/${row.application_id}`)}
              >
                <td className="px-4 py-3">
                  {row.student_name}
                  <div className="text-igqs-muted">{row.mobile}</div>
                  <div className="font-mono text-xs text-igqs-label">{row.application_id}</div>
                </td>
                <td className="px-4 py-3">{row.applying_class}</td>
                <td className="px-4 py-3">{formatMoney(row.payment_amount, locale)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} label={applicationStatus(row.status, ta)} />
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(row.created_at).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/payments/applications/${row.application_id}`}
                    className={btn.secondary}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {t("review")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !loadError && rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-igqs-muted">{t("noApplications")}</p>
        )}
      </div>
      {!loading && !loadError && rows.length === 0 && (
        <p className="mt-6 text-center text-sm text-igqs-muted md:hidden">{t("noApplications")}</p>
      )}
    </div>
  );
}

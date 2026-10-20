"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/staff/StatusBadge";
import { btn } from "@/components/staff/buttons";
import { Link, useRouter } from "@/i18n/navigation";
import { formatMoney, staffRequest, type StaffApplicationListItem, type StaffStats } from "@/lib/staff";

function isUnauthorized(err: unknown) {
  return err instanceof Error && err.message === "unauthorized";
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-igqs-gold/25 bg-white p-5 dark:bg-[#0d1f18]">
      <p className="text-xs uppercase tracking-[0.18em] text-igqs-label">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}

function statusLabel(status: string, t: (key: "approved" | "rejected" | "pending") => string) {
  if (status === "approved") return t("approved");
  if (status === "rejected") return t("rejected");
  return t("pending");
}

export function StaffDashboard() {
  const t = useTranslations("staff");
  const ta = useTranslations("admission");
  const locale = useLocale();
  const router = useRouter();
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [recent, setRecent] = useState<StaffApplicationListItem[]>([]);
  const [recentError, setRecentError] = useState(false);
  const [error, setError] = useState("");
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    setError("");
    staffRequest<StaffStats>("/api/admissions/staff/stats/")
      .then(setStats)
      .catch((err) => {
        if (isUnauthorized(err)) {
          router.replace("/login");
          return;
        }
        setError(t("loadError"));
      });
    staffRequest<{ results: StaffApplicationListItem[] }>("/api/admissions/staff/applications/?sort=-created_at&page_size=8")
      .then((data) => {
        setRecent(data.results.slice(0, 8));
        setRecentError(false);
      })
      .catch((err) => {
        if (isUnauthorized(err)) {
          router.replace("/login");
          return;
        }
        setRecent([]);
        setRecentError(true);
      });
  }, [t, router, reloadTick]);

  const money = (value: string) => formatMoney(value, locale, stats?.currency);

  return (
    <div>
      {/* A failed stats request used to replace the entire dashboard, taking
          the recent-applications table with it. Now only the cards fail, and
          they offer a retry. */}
      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {error}
          <button type="button" className="font-semibold underline" onClick={() => setReloadTick((v) => v + 1)}>
            {t("retry")}
          </button>
        </div>
      ) : !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-busy="true">
          {[0, 1, 2, 3, 4].map((card) => (
            <div key={card} className="h-28 animate-pulse rounded-3xl bg-white dark:bg-white/5" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label={t("total")} value={stats.total} />
            <StatCard label={t("successful")} value={stats.approved} />
            <StatCard label={t("pending")} value={stats.pending} />
            <StatCard label={t("failed")} value={stats.rejected} />
            <StatCard label={t("feeCollected")} value={money(stats.fee_collected)} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label={t("today")} value={stats.today} />
            <StatCard label={t("feePending")} value={money(stats.fee_pending)} />
            <StatCard label={t("feeSubmitted")} value={money(stats.fee_submitted)} />
          </div>
        </>
      )}
      <div className="mt-10 overflow-hidden rounded-3xl border border-igqs-gold/25 bg-white dark:bg-[#0d1f18]">
        <div className="flex items-center justify-between gap-3 px-6 pt-6">
          <h2 className="font-display text-2xl">{t("applications")}</h2>
          <Link href="/payments/applications" className={btn.secondary}>
            {t("manageApplications")}
          </Link>
        </div>
        {recentError ? (
          <p className="px-6 py-6 text-sm text-red-700 dark:text-red-300">{t("loadError")}</p>
        ) : recent.length === 0 ? (
          <p className="px-6 py-6 text-sm text-igqs-muted">{t("noApplications")}</p>
        ) : (
          <>
            <div className="space-y-3 px-4 py-4 md:hidden">
              {recent.map((row) => (
                <Link
                  key={row.application_id}
                  href={`/payments/applications/${row.application_id}`}
                  className="block rounded-2xl border border-igqs-gold/15 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{row.student_name}</p>
                    <StatusBadge status={row.status} label={statusLabel(row.status, ta)} />
                  </div>
                  <p className="mt-1 text-sm text-igqs-muted">{row.applying_class}</p>
                  <p className="mt-2 text-sm">{formatMoney(row.payment_amount, locale, stats?.currency)}</p>
                </Link>
              ))}
            </div>
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-igqs-gold/20 text-xs uppercase tracking-[0.12em] text-igqs-label">
                  <tr>
                    <th className="px-6 py-3">{t("student")}</th>
                    <th className="px-3 py-3">{t("applyingClass")}</th>
                    <th className="px-3 py-3">{t("amount")}</th>
                    <th className="px-3 py-3">{t("status")}</th>
                    <th className="px-6 py-3">{t("date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((row) => (
                    <tr key={row.application_id} className="border-t border-igqs-gold/10">
                      <td className="px-6 py-3">
                        <Link href={`/payments/applications/${row.application_id}`} className="font-semibold text-igqs-green hover:underline dark:text-igqs-gold">
                          {row.student_name}
                        </Link>
                      </td>
                      <td className="px-3 py-3">{row.applying_class}</td>
                      <td className="px-3 py-3">{formatMoney(row.payment_amount, locale, stats?.currency)}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={row.status} label={statusLabel(row.status, ta)} />
                      </td>
                      <td className="px-6 py-3">
                        {new Date(row.created_at).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <div className="mt-10 rounded-3xl border border-igqs-gold/25 bg-white p-6 dark:bg-[#0d1f18]">
        <h2 className="font-display text-2xl">{t("byClass")}</h2>
        {!stats ? null : stats.by_class.length === 0 ? (
          <p className="mt-4 text-sm text-igqs-muted">{t("noApplications")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-igqs-gold/15">
            {stats.by_class.map((row) => (
              <li key={row.applying_class}>
                <Link
                  href={`/payments/applications?applying_class=${encodeURIComponent(row.applying_class)}`}
                  className="flex min-h-11 items-center justify-between py-3 text-sm hover:underline"
                >
                  <span>{row.applying_class}</span>
                  <strong>{row.total}</strong>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

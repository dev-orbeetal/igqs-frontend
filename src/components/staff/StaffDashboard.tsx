"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { staffRequest, type StaffApplicationListItem, type StaffStats } from "@/lib/staff";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-igqs-gold/25 bg-white p-5 dark:bg-[#0d1f18]">
      <p className="text-xs uppercase tracking-[0.18em] text-igqs-gold">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}

export function StaffDashboard() {
  const t = useTranslations("staff");
  const locale = useLocale();
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [recent, setRecent] = useState<StaffApplicationListItem[]>([]);

  useEffect(() => {
    staffRequest<StaffStats>("/api/admissions/staff/stats/").then(setStats);
    staffRequest<{ results: StaffApplicationListItem[] }>("/api/admissions/staff/applications/?sort=-created_at")
      .then((data) => setRecent(data.results.slice(0, 8)))
      .catch(() => setRecent([]));
  }, []);

  if (!stats) return <p className="text-sm text-igqs-muted">{t("loading")}</p>;

  const money = (value: string) =>
    `${stats.currency} ${Number(value).toLocaleString(locale === "bn" ? "bn-BD" : "en-GB")}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-igqs-gold">{t("kicker")}</p>
          <h1 className="mt-2 font-display text-4xl">{t("dashboard")}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/staff/content"
            className="rounded-full border border-igqs-gold/40 px-5 py-2 text-sm"
          >
            {t("website")}
          </Link>
          <Link
            href="/staff/applications"
            className="rounded-full bg-igqs-green px-5 py-2 text-sm text-igqs-cream dark:bg-igqs-gold dark:text-igqs-ink"
          >
            {t("manageApplications")}
          </Link>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
      <div className="mt-10 overflow-hidden rounded-3xl border border-igqs-gold/25 bg-white dark:bg-[#0d1f18]">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="font-display text-2xl">{t("applications")}</h2>
          <Link href="/staff/applications" className="text-sm text-igqs-gold underline">
            {t("manageApplications")}
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-6 py-6 text-sm text-igqs-muted">{t("noApplications")}</p>
        ) : (
          <table className="mt-4 min-w-full text-left text-sm">
            <thead className="border-b border-igqs-gold/20 text-xs uppercase tracking-[0.12em] text-igqs-gold">
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
                    <Link href={`/staff/applications/${row.application_id}`} className="hover:underline">
                      {row.student_name}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{row.applying_class}</td>
                  <td className="px-3 py-3">
                    {stats.currency} {Number(row.payment_amount).toLocaleString(locale === "bn" ? "bn-BD" : "en-GB")}
                  </td>
                  <td className="px-3 py-3">
                    {row.status === "approved" ? t("successful") : row.status === "rejected" ? t("failed") : t("pending")}
                  </td>
                  <td className="px-6 py-3">
                    {new Date(row.created_at).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-10 rounded-3xl border border-igqs-gold/25 bg-white p-6 dark:bg-[#0d1f18]">
        <h2 className="font-display text-2xl">{t("byClass")}</h2>
        {stats.by_class.length === 0 ? (
          <p className="mt-4 text-sm text-igqs-muted">{t("noApplications")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-igqs-gold/15">
            {stats.by_class.map((row) => (
              <li key={row.applying_class} className="flex justify-between py-3 text-sm">
                <span>{row.applying_class}</span>
                <strong>{row.total}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

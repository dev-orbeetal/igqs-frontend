"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/staff/ConfirmDialog";
import { btn } from "@/components/staff/buttons";
import { StatusBadge } from "@/components/staff/StatusBadge";
import { fieldClass } from "@/lib/cms";
import { staffRequest } from "@/lib/staff";

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export function MessagesManager() {
  const t = useTranslations("cms");
  const locale = useLocale();
  const [rows, setRows] = useState<ContactMessage[]>([]);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);

  useEffect(() => {
    staffRequest<ContactMessage[]>("/api/staff/messages/")
      .then((data) => {
        setRows(data);
        setLoadError(false);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoaded(true));
  }, [tick]);

  // Both of these used to `await` with no error handling: a failed PATCH or
  // DELETE left the row untouched and said nothing, so the click looked
  // like it had simply been ignored.
  async function toggleRead(row: ContactMessage) {
    setActionError("");
    setBusyId(row.id);
    try {
      const updated = await staffRequest<ContactMessage>(`/api/staff/messages/${row.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_read: !row.is_read }),
      });
      setRows((current) => current.map((item) => (item.id === row.id ? updated : item)));
    } catch (err) {
      setActionError(err instanceof Error && err.message ? err.message : t("error"));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    setActionError("");
    setBusyId(target.id);
    try {
      await staffRequest(`/api/staff/messages/${target.id}/`, { method: "DELETE" });
      setRows((current) => current.filter((item) => item.id !== target.id));
    } catch (err) {
      setActionError(err instanceof Error && err.message ? err.message : t("error"));
    } finally {
      setBusyId(null);
    }
  }

  const visible = rows.filter((row) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [row.name, row.email, row.phone, row.subject, row.message].some((value) =>
      value.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <p className="max-w-2xl text-sm text-igqs-muted">{t("messagesHint")}</p>
      <label className="mt-4 block text-sm font-medium sm:max-w-sm">
        {t("searchList")}
        <input className={fieldClass} value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>

      {loadError && (
        <p className="mt-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {t("error")}
          <button
            type="button"
            className="ml-3 font-semibold underline"
            onClick={() => setTick((value) => value + 1)}
          >
            {t("retry")}
          </button>
        </p>
      )}

      <p
        role="alert"
        className={
          actionError
            ? "mt-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
            : "sr-only"
        }
      >
        {actionError}
      </p>

      {loaded && !loadError && visible.length === 0 && (
        <p className="mt-4 rounded-2xl border border-dashed border-igqs-border-strong dark:border-igqs-gold/70 px-4 py-8 text-center text-sm text-igqs-muted">
          {t("noMessages")}
        </p>
      )}

      <div className="mt-4 space-y-3">
        {visible.map((row) => (
          <article
            key={row.id}
            className={`rounded-2xl border p-4 ${
              row.is_read
                ? "border-igqs-gold/20 bg-white dark:bg-[#0d1f18]"
                : "border-igqs-green/50 bg-igqs-sand/40 dark:border-igqs-gold/60 dark:bg-white/5"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{row.subject}</p>
                <p className="mt-1 text-sm text-igqs-muted">
                  {t("messageFrom")}: {row.name} · {row.email}
                  {row.phone ? ` · ${row.phone}` : ""}
                </p>
              </div>
              {/* Same badge the application list uses, instead of a third
                  bespoke pill style for the same idea. */}
              <StatusBadge
                status={row.is_read ? "approved" : "pending"}
                label={row.is_read ? t("readStatus") : t("unreadStatus")}
              />
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{row.message}</p>
            <p className="mt-2 text-xs text-igqs-muted">
              {new Date(row.created_at).toLocaleString(locale === "bn" ? "bn-BD" : "en-GB")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={btn.secondary}
                disabled={busyId === row.id}
                onClick={() => toggleRead(row)}
              >
                {row.is_read ? t("markUnread") : t("markRead")}
              </button>
              <button
                type="button"
                className={btn.danger}
                disabled={busyId === row.id}
                onClick={() => setPendingDelete(row)}
              >
                {t("delete")}
              </button>
            </div>
          </article>
        ))}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("confirmTitle")}
        message={t("deleteMessageConfirm")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

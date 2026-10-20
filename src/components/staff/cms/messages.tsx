"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/staff/ConfirmDialog";
import { btn } from "@/components/staff/buttons";
import { staffRequest } from "@/lib/staff";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-igqs-gold/30 bg-transparent px-3 py-2 text-sm";

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
  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);

  useEffect(() => {
    staffRequest<ContactMessage[]>("/api/staff/messages/")
      .then((data) => {
        setRows(data);
        setLoadError(false);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoaded(true));
  }, []);

  async function toggleRead(row: ContactMessage) {
    const updated = await staffRequest<ContactMessage>(`/api/staff/messages/${row.id}/`, {
      method: "PATCH",
      body: JSON.stringify({ is_read: !row.is_read }),
    });
    setRows((current) => current.map((item) => (item.id === row.id ? updated : item)));
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await staffRequest(`/api/staff/messages/${pendingDelete.id}/`, { method: "DELETE" });
    setRows((current) => current.filter((item) => item.id !== pendingDelete.id));
    setPendingDelete(null);
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
        </p>
      )}

      {loaded && !loadError && visible.length === 0 && (
        <p className="mt-4 rounded-2xl border border-dashed border-igqs-gold/40 px-4 py-8 text-center text-sm text-igqs-muted">
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
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  row.is_read
                    ? "bg-igqs-sand text-igqs-muted dark:bg-white/10"
                    : "bg-igqs-green text-igqs-cream dark:bg-igqs-gold dark:text-igqs-ink"
                }`}
              >
                {row.is_read ? t("readStatus") : t("unreadStatus")}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{row.message}</p>
            <p className="mt-2 text-xs text-igqs-muted">
              {new Date(row.created_at).toLocaleString(locale === "bn" ? "bn-BD" : "en-GB")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className={btn.secondary} onClick={() => toggleRead(row)}>
                {row.is_read ? t("markUnread") : t("markRead")}
              </button>
              <button type="button" className={btn.danger} onClick={() => setPendingDelete(row)}>
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

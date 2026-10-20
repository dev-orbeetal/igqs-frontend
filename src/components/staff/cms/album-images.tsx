"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/staff/ConfirmDialog";
import { CmsFields, FormActions, type FieldErrors } from "@/components/staff/cms/fields";
import { ImageFileInput } from "@/components/ui/ImageFileInput";
import { requestBody, type CmsField } from "@/lib/cms";
import { StaffApiError, staffRequest } from "@/lib/staff";

const captionFields: CmsField[] = [
  { type: "pair", name: "caption", label: "fCaption" },
  { type: "number", name: "order", label: "fOrder" },
];

function imageLabel(row: Record<string, unknown>) {
  const caption = String(row.caption_en ?? "").trim();
  if (caption) return caption;
  const src = typeof row.image_src === "string" ? row.image_src : "";
  return src.split("/").pop()?.split("?")[0] || String(row.id);
}

export function AlbumImages({ albumId }: { albumId: string }) {
  const t = useTranslations("cms");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [queued, setQueued] = useState<Record<string, unknown> | null | undefined>(undefined);
  const [dirty, setDirty] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loadError, setLoadError] = useState(false);
  const [tick, setTick] = useState(0);

  const reload = useCallback(async () => {
    const data = await staffRequest<Record<string, unknown>[]>(`/api/staff/images/?album=${albumId}`);
    setRows(data);
    setLoadError(false);
    return data;
  }, [albumId]);

  // This reload used to run with no `.catch`, so a failed list request just
  // left an empty panel with no explanation.
  useEffect(() => {
    reload().catch(() => setLoadError(true));
  }, [reload, tick]);

  function open(row: Record<string, unknown> | null) {
    if (dirty) {
      setQueued(row);
      return;
    }
    load(row);
  }

  function load(row: Record<string, unknown> | null) {
    setSelected(row);
    setDirty(false);
    setSaved(false);
    setError("");
    setFieldErrors({});
  }

  function fail(err: unknown) {
    if (err instanceof StaffApiError) {
      setFieldErrors(err.fieldErrors);
      setError(err.message || (Object.keys(err.fieldErrors).length ? "" : t("error")));
      return;
    }
    setError(err instanceof Error && err.message ? err.message : t("error"));
  }

  async function upload(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    setSaved(false);
    setError("");
    const form = new FormData();
    form.append("album", albumId);
    for (const file of files) form.append("images", file);
    try {
      await staffRequest("/api/staff/images/bulk/", { method: "POST", body: form });
      setInputKey((key) => key + 1);
      await reload();
    } catch (err) {
      fail(err);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!selected?.id) return;
    setSaving(true);
    setSaved(false);
    setError("");
    setFieldErrors({});
    try {
      const updated = await staffRequest<Record<string, unknown>>(`/api/staff/images/${selected.id}/`, {
        method: "PATCH",
        body: requestBody(captionFields, {
          album: Number(albumId),
          caption_en: selected.caption_en,
          caption_bn: selected.caption_bn,
          order: selected.order,
        }),
      });
      const data = await reload();
      setSelected(data.find((row) => row.id === updated.id) ?? updated);
      setDirty(false);
      setSaved(true);
    } catch (err) {
      fail(err);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!selected?.id) return;
    setSaving(true);
    setError("");
    try {
      await staffRequest(`/api/staff/images/${selected.id}/`, { method: "DELETE" });
      load(null);
      await reload();
    } catch (err) {
      fail(err);
    } finally {
      setSaving(false);
    }
  }

  const preview = typeof selected?.image_src === "string" ? selected.image_src : "";

  return (
    <div className="grid gap-6">
      <label className="rounded-2xl border border-dashed border-igqs-border-strong bg-white p-4 text-sm dark:border-igqs-gold/70 dark:bg-[#10261e]">
        {t("uploadImages")}
        <span className="mt-1 block text-xs leading-relaxed text-igqs-muted">{t("uploadImagesHint")}</span>
        <ImageFileInput
          key={inputKey}
          multiple
          disabled={uploading}
          onFiles={(files) => void upload(files)}
        />
      </label>
      <p aria-live="polite" className="text-sm text-igqs-muted">
        {uploading ? t("uploading") : ""}
      </p>

      {loadError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {t("loadError")}
          <button
            type="button"
            className="ml-3 font-semibold underline"
            onClick={() => setTick((value) => value + 1)}
          >
            {t("retry")}
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <ul className="space-y-1 text-sm">
          {rows.map((row) => (
            <li key={String(row.id)}>
              <button
                type="button"
                aria-current={selected?.id === row.id ? "true" : undefined}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left ${
                  selected?.id === row.id
                    ? "bg-igqs-gold/20 font-semibold text-igqs-green dark:text-igqs-gold-soft"
                    : "hover:bg-igqs-gold/10"
                }`}
                onClick={() => open(row)}
              >
                {typeof row.image_src === "string" && row.image_src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-only 32px thumbnail
                  <img src={row.image_src} alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded object-cover" />
                ) : null}
                <span className="min-w-0 truncate">{imageLabel(row)}</span>
              </button>
            </li>
          ))}
        </ul>
        {selected ? (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin-only preview of a stored media URL
              <img src={preview} alt="" width={320} height={160} className="mb-4 h-40 w-full max-w-xs rounded-xl object-cover" />
            ) : (
              <p className="mb-4 rounded-xl bg-igqs-sand/60 px-3 py-6 text-center text-sm text-igqs-muted dark:bg-white/5">
                {t("imageEmpty")}
              </p>
            )}
            <CmsFields
              fields={captionFields}
              values={selected}
              onChange={(next) => {
                setSelected(next);
                setDirty(true);
              }}
              errors={fieldErrors}
              englishLabel={t("english")}
              bengaliLabel={t("bengali")}
            />
            {(error || Object.keys(fieldErrors).length > 0) && (
              <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">
                {error || t("fixHighlighted")}
              </p>
            )}
            <FormActions
              saving={saving}
              dirty={dirty}
              saveLabel={t("save")}
              savingLabel={t("saving")}
              savedLabel={t("saved")}
              deleteLabel={t("delete")}
              onDelete={remove}
              saved={saved}
            />
          </form>
        ) : (
          <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-igqs-border-strong px-4 py-8 text-center text-sm text-igqs-muted dark:border-igqs-gold/70">
            {rows.length === 0 ? t("noImages") : t("chooseImage")}
          </div>
        )}
      </div>
      {!selected && error && <p className="text-sm text-red-700 dark:text-red-300">{error}</p>}
      <ConfirmDialog
        open={queued !== undefined}
        title={t("unsavedTitle")}
        message={t("unsavedMessage")}
        confirmLabel={t("discardChanges")}
        cancelLabel={t("keepEditing")}
        onCancel={() => setQueued(undefined)}
        onConfirm={() => {
          const next = queued;
          setQueued(undefined);
          if (next !== undefined) load(next);
        }}
      />
    </div>
  );
}

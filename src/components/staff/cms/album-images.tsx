"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CmsFields, FormActions } from "@/components/staff/cms/fields";
import { ImageFileInput } from "@/components/ui/ImageFileInput";
import { requestBody, type CmsField } from "@/lib/cms";
import { staffRequest } from "@/lib/staff";

const captionFields: CmsField[] = [
  { type: "pair", name: "caption", label: "Caption" },
  { type: "number", name: "order", label: "Order" },
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
  const [inputKey, setInputKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function reload() {
    const data = await staffRequest<Record<string, unknown>[]>(`/api/staff/images/?album=${albumId}`);
    setRows(data);
    return data;
  }

  useEffect(() => {
    reload();
  }, [albumId]);

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
    } catch {
      setError(t("error"));
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!selected?.id) return;
    setSaving(true);
    setSaved(false);
    setError("");
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
      setSelected(updated);
      setSaved(true);
      const data = await reload();
      setSelected(data.find((row) => row.id === updated.id) ?? updated);
    } catch {
      setError(t("error"));
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
      setSelected(null);
      setSaved(false);
      await reload();
    } catch {
      setError(t("error"));
    } finally {
      setSaving(false);
    }
  }

  const preview = typeof selected?.image_src === "string" ? selected.image_src : "";

  return (
    <div className="grid gap-6">
      <label className="text-sm">
        {t("uploadImages")}
        <span className="mt-1 block text-igqs-muted">{t("uploadImagesHint")}</span>
        <ImageFileInput
          key={inputKey}
          multiple
          disabled={uploading}
          onFiles={(files) => void upload(files)}
        />
      </label>
      {uploading && <p className="text-sm text-igqs-muted">{t("uploading")}</p>}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <ul className="space-y-1 text-sm">
          {rows.map((row) => (
            <li key={String(row.id)}>
              <button
                type="button"
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left ${
                  selected?.id === row.id ? "bg-igqs-gold/15 text-igqs-gold" : "hover:bg-igqs-gold/10"
                }`}
                onClick={() => {
                  setSelected(row);
                  setSaved(false);
                  setError("");
                }}
              >
                {typeof row.image_src === "string" && row.image_src ? (
                  <img src={row.image_src} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
                ) : null}
                <span className="min-w-0 truncate">{imageLabel(row)}</span>
              </button>
            </li>
          ))}
        </ul>
        {selected ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            {preview && <img src={preview} alt="" className="mb-4 h-28 w-40 rounded-xl object-cover" />}
            <CmsFields
              fields={captionFields}
              values={selected}
              onChange={setSelected}
              englishLabel={t("english")}
              bengaliLabel={t("bengali")}
            />
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
            <FormActions
              saving={saving}
              saveLabel={t("save")}
              savingLabel={t("saving")}
              savedLabel={t("saved")}
              deleteLabel={t("delete")}
              onDelete={remove}
              saved={saved}
            />
          </form>
        ) : (
          <p className="text-sm text-igqs-muted">{rows.length === 0 ? t("noImages") : t("chooseImage")}</p>
        )}
      </div>
      {!selected && error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}

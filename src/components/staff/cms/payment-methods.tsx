"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { staffRequest } from "@/lib/staff";

const fieldClass =
  "mt-1 w-full rounded-xl border border-igqs-gold/30 bg-transparent px-3 py-2 text-sm";

type Detail = {
  label_en: string;
  label_bn: string;
  value_en: string;
  value_bn: string;
};

type Method = {
  id: number;
  code: string;
  name_en: string;
  name_bn: string;
  is_active: boolean;
  order: number;
  details: Detail[];
};

const emptyDetail = (): Detail => ({ label_en: "", label_bn: "", value_en: "", value_bn: "" });

export function PaymentMethodsEditor() {
  const t = useTranslations("cms");
  const [methods, setMethods] = useState<Method[]>([]);
  const [selected, setSelected] = useState<Method | null>(null);
  const [nameEn, setNameEn] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function reload() {
    const data = await staffRequest<Method[]>("/api/staff/methods/");
    setMethods(data);
    return data;
  }

  useEffect(() => {
    reload().catch(() => setError(t("error")));
  }, [t]);

  async function addMethod() {
    setSaving(true);
    setError("");
    try {
      const created = await staffRequest<Method>("/api/staff/methods/", {
        method: "POST",
        body: JSON.stringify({
          name_en: nameEn,
          name_bn: nameBn,
          is_active: true,
          order: methods.length,
          details: [emptyDetail()],
        }),
      });
      setNameEn("");
      setNameBn("");
      const data = await reload();
      const opened = data.find((method) => method.id === created.id) ?? created;
      setSelected({ ...opened, details: opened.details.length ? opened.details : [emptyDetail()] });
    } catch {
      setError(t("error"));
    } finally {
      setSaving(false);
    }
  }

  function updateDetail(index: number, key: keyof Detail, value: string) {
    setSelected((current) => {
      if (!current) return current;
      const details = current.details.map((detail, detailIndex) =>
        detailIndex === index ? { ...detail, [key]: value } : detail
      );
      return { ...current, details };
    });
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const updated = await staffRequest<Method>(`/api/staff/methods/${selected.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          name_en: selected.name_en,
          name_bn: selected.name_bn,
          is_active: selected.is_active,
          order: selected.order,
          details: selected.details,
        }),
      });
      setSelected(updated);
      await reload();
    } catch {
      setError(t("error"));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      await staffRequest(`/api/staff/methods/${selected.id}/`, { method: "DELETE" });
      setSelected(null);
      await reload();
    } catch {
      setError(t("error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <form
        className="grid gap-3 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void addMethod();
        }}
      >
        <label className="text-sm">
          {t("methodNameEn")}
          <input className={fieldClass} value={nameEn} onChange={(event) => setNameEn(event.currentTarget.value)} required />
        </label>
        <label className="text-sm">
          {t("methodNameBn")}
          <input className={fieldClass} value={nameBn} onChange={(event) => setNameBn(event.currentTarget.value)} required />
        </label>
        <div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-igqs-green px-5 py-2 text-sm text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
          >
            {t("addMethod")}
          </button>
        </div>
      </form>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <ul className="space-y-1 text-sm">
          {methods.map((method) => (
            <li key={method.id}>
              <button
                type="button"
                className={`w-full rounded-xl px-3 py-2 text-left ${
                  selected?.id === method.id ? "bg-igqs-gold/15 text-igqs-gold" : "hover:bg-igqs-gold/10"
                }`}
                onClick={() => setSelected(method)}
              >
                {method.name_en}
              </button>
            </li>
          ))}
        </ul>
        {selected ? (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                {t("methodNameEn")}
                <input
                  className={fieldClass}
                  value={selected.name_en}
                  onChange={(event) => setSelected({ ...selected, name_en: event.currentTarget.value })}
                />
              </label>
              <label className="text-sm">
                {t("methodNameBn")}
                <input
                  className={fieldClass}
                  value={selected.name_bn}
                  onChange={(event) => setSelected({ ...selected, name_bn: event.currentTarget.value })}
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.is_active}
                onChange={(event) => setSelected({ ...selected, is_active: event.currentTarget.checked })}
              />
              {t("methodActive")}
            </label>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl">{t("methodFields")}</h3>
                <button
                  type="button"
                  className="text-sm text-igqs-gold underline"
                  onClick={() => setSelected({ ...selected, details: [...selected.details, emptyDetail()] })}
                >
                  {t("addField")}
                </button>
              </div>
              <p className="text-sm text-igqs-muted">{t("methodFieldsHint")}</p>
              {selected.details.map((detail, index) => (
                <div key={index} className="grid gap-3 rounded-2xl border border-igqs-gold/20 p-3 md:grid-cols-2">
                  <label className="text-sm">
                    {t("fieldLabelEn")}
                    <input
                      className={fieldClass}
                      value={detail.label_en}
                      onChange={(event) => updateDetail(index, "label_en", event.currentTarget.value)}
                    />
                  </label>
                  <label className="text-sm">
                    {t("fieldLabelBn")}
                    <input
                      className={fieldClass}
                      value={detail.label_bn}
                      onChange={(event) => updateDetail(index, "label_bn", event.currentTarget.value)}
                    />
                  </label>
                  <label className="text-sm">
                    {t("fieldValueEn")}
                    <textarea
                      className={fieldClass}
                      rows={2}
                      value={detail.value_en}
                      onChange={(event) => updateDetail(index, "value_en", event.currentTarget.value)}
                    />
                  </label>
                  <label className="text-sm">
                    {t("fieldValueBn")}
                    <textarea
                      className={fieldClass}
                      rows={2}
                      value={detail.value_bn}
                      onChange={(event) => updateDetail(index, "value_bn", event.currentTarget.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="w-fit text-sm text-red-700 underline"
                    onClick={() =>
                      setSelected({
                        ...selected,
                        details: selected.details.filter((_, detailIndex) => detailIndex !== index),
                      })
                    }
                  >
                    {t("removeField")}
                  </button>
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-igqs-green px-5 py-2 text-sm text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
              >
                {saving ? t("saving") : t("save")}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void remove()}
                className="rounded-full border border-red-400 px-5 py-2 text-sm text-red-700"
              >
                {t("delete")}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-igqs-muted">{error || t("chooseOrAdd")}</p>
        )}
      </div>
    </div>
  );
}

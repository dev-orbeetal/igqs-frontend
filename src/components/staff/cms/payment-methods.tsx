"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/staff/ConfirmDialog";
import { btn } from "@/components/staff/buttons";
import { LangMark } from "@/components/staff/cms/fields";
import { fieldClass } from "@/lib/cms";
import { staffRequest } from "@/lib/staff";

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
  const [confirming, setConfirming] = useState(false);

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
          <LangMark code="en" label={t("english")} />
          <input className={fieldClass} value={nameEn} onChange={(event) => setNameEn(event.currentTarget.value)} required />
        </label>
        <label className="text-sm">
          <LangMark code="bn" label={t("bengali")} />
          <input className={fieldClass} value={nameBn} onChange={(event) => setNameBn(event.currentTarget.value)} required />
        </label>
        <div>
          <button
            type="submit"
            disabled={saving}
            className={btn.primary}
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
            <div className="grid gap-3 rounded-2xl border border-igqs-gold/20 bg-white p-4 dark:bg-[#10261e] md:grid-cols-2">
              <label className="text-sm">
                <LangMark code="en" label={t("english")} />
                <input
                  className={fieldClass}
                  value={selected.name_en}
                  onChange={(event) => setSelected({ ...selected, name_en: event.currentTarget.value })}
                />
              </label>
              <label className="text-sm">
                <LangMark code="bn" label={t("bengali")} />
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
                  className={btn.secondary}
                  onClick={() => setSelected({ ...selected, details: [...selected.details, emptyDetail()] })}
                >
                  {t("addField")}
                </button>
              </div>
              <p className="text-sm text-igqs-muted">{t("methodFieldsHint")}</p>
              {selected.details.map((detail, index) => (
                <div key={index} className="grid gap-3 rounded-2xl border border-igqs-gold/20 bg-igqs-sand/40 p-4 dark:bg-white/[0.04] md:grid-cols-2">
                  <label className="text-sm">
                    <LangMark code="en" label={t("fieldLabelEn")} />
                    <input
                      className={fieldClass}
                      value={detail.label_en}
                      onChange={(event) => updateDetail(index, "label_en", event.currentTarget.value)}
                    />
                  </label>
                  <label className="text-sm">
                    <LangMark code="bn" label={t("fieldLabelBn")} />
                    <input
                      className={fieldClass}
                      value={detail.label_bn}
                      onChange={(event) => updateDetail(index, "label_bn", event.currentTarget.value)}
                    />
                  </label>
                  <label className="text-sm">
                    <LangMark code="en" label={t("fieldValueEn")} />
                    <textarea
                      className={`${fieldClass} min-h-20`}
                      rows={2}
                      value={detail.value_en}
                      onChange={(event) => updateDetail(index, "value_en", event.currentTarget.value)}
                    />
                  </label>
                  <label className="text-sm">
                    <LangMark code="bn" label={t("fieldValueBn")} />
                    <textarea
                      className={`${fieldClass} min-h-20`}
                      rows={2}
                      value={detail.value_bn}
                      onChange={(event) => updateDetail(index, "value_bn", event.currentTarget.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className={`w-fit ${btn.danger}`}
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
                className={btn.primary}
              >
                {saving ? t("saving") : t("save")}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirming(true)}
                className={btn.danger}
              >
                {t("delete")}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-igqs-muted">{error || t("chooseOrAdd")}</p>
        )}
      </div>
      <ConfirmDialog
        open={confirming}
        title={t("confirmTitle")}
        message={t("confirmDelete")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          void remove();
        }}
      />
    </div>
  );
}

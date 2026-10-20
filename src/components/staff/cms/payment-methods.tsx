"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/staff/ConfirmDialog";
import { btn } from "@/components/staff/buttons";
import { LangMark } from "@/components/staff/cms/fields";
import { fieldClass, fieldClassFor } from "@/lib/cms";
import { StaffApiError, staffRequest } from "@/lib/staff";

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
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [queued, setQueued] = useState<Method | null | undefined>(undefined);
  const [confirming, setConfirming] = useState(false);
  const [loaded, setLoaded] = useState(false);

  function fail(err: unknown) {
    if (err instanceof StaffApiError) {
      setFieldErrors(err.fieldErrors);
      setError(err.message || (Object.keys(err.fieldErrors).length ? "" : t("error")));
      return;
    }
    setError(err instanceof Error && err.message ? err.message : t("error"));
  }

  function load(method: Method | null) {
    setSelected(method);
    setDirty(false);
    setSaved(false);
    setError("");
    setFieldErrors({});
  }

  function open(method: Method | null) {
    if (dirty) {
      setQueued(method);
      return;
    }
    load(method);
  }

  function edit(next: Method) {
    setSelected(next);
    setDirty(true);
    setSaved(false);
  }

  async function reload() {
    const data = await staffRequest<Method[]>("/api/staff/methods/");
    setMethods(data);
    setLoaded(true);
    return data;
  }

  useEffect(() => {
    reload()
      .catch(() => setError(t("error")))
      .finally(() => setLoaded(true));
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
      load({ ...opened, details: opened.details.length ? opened.details : [emptyDetail()] });
    } catch (err) {
      fail(err);
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
    setDirty(true);
    setSaved(false);
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
      load(updated);
      setSaved(true);
      await reload();
    } catch (err) {
      fail(err);
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
      load(null);
      await reload();
    } catch (err) {
      fail(err);
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
          <LangMark code="en" label={`${t("english")} *`} />
          <input
            className={fieldClassFor(Boolean(fieldErrors.name_en))}
            value={nameEn}
            onChange={(event) => setNameEn(event.currentTarget.value)}
            required
          />
          {fieldErrors.name_en && (
            <span className="mt-1.5 block text-xs font-medium text-red-700 dark:text-red-300">{fieldErrors.name_en}</span>
          )}
        </label>
        <label className="text-sm">
          <LangMark code="bn" label={`${t("bengali")} *`} />
          <input
            className={fieldClassFor(Boolean(fieldErrors.name_bn))}
            value={nameBn}
            onChange={(event) => setNameBn(event.currentTarget.value)}
            required
          />
          {fieldErrors.name_bn && (
            <span className="mt-1.5 block text-xs font-medium text-red-700 dark:text-red-300">{fieldErrors.name_bn}</span>
          )}
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
        <div>
          {loaded && methods.length === 0 ? (
            <p className="rounded-xl border border-dashed border-igqs-border-strong px-3 py-6 text-center text-sm text-igqs-muted dark:border-igqs-gold/70">
              {t("noMethods")}
            </p>
          ) : (
            <ul className="space-y-1 text-sm">
              {methods.map((method) => (
                <li key={method.id}>
                  <button
                    type="button"
                    aria-current={selected?.id === method.id ? "true" : undefined}
                    className={`w-full min-h-11 rounded-xl px-3 py-2 text-left ${
                      selected?.id === method.id
                        ? "bg-igqs-gold/20 font-semibold text-igqs-green dark:text-igqs-gold-soft"
                        : "hover:bg-igqs-gold/10"
                    }`}
                    onClick={() => open(method)}
                  >
                    {method.name_en}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
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
                  onChange={(event) => edit({ ...selected, name_en: event.currentTarget.value })}
                />
              </label>
              <label className="text-sm">
                <LangMark code="bn" label={t("bengali")} />
                <input
                  className={fieldClass}
                  value={selected.name_bn}
                  onChange={(event) => edit({ ...selected, name_bn: event.currentTarget.value })}
                />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="size-6 accent-igqs-green"
                  checked={selected.is_active}
                  onChange={(event) => edit({ ...selected, is_active: event.currentTarget.checked })}
                />
                {t("methodActive")}
              </label>
              {/* `order` was sent on every save but had no input, so methods
                  could not be reordered from the panel at all. */}
              <label className="text-sm font-medium">
                {t("fOrder")}
                <input
                  className={fieldClass}
                  inputMode="numeric"
                  value={String(selected.order ?? "")}
                  onChange={(event) => {
                    const next = event.currentTarget.value;
                    if (next !== "" && !/^\d*$/.test(next)) return;
                    edit({ ...selected, order: next === "" ? 0 : Number(next) });
                  }}
                />
              </label>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl">{t("methodFields")}</h3>
                <button
                  type="button"
                  className={btn.secondary}
                  onClick={() => edit({ ...selected, details: [...selected.details, emptyDetail()] })}
                >
                  {t("addField")}
                </button>
              </div>
              <p className="text-sm text-igqs-muted">{t("methodFieldsHint")}</p>
              {selected.details.map((detail, index) => {
                // The API drops a row where every box is blank, which used to
                // happen silently on save.
                const blank = !detail.label_en && !detail.label_bn && !detail.value_en && !detail.value_bn;
                return (
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
                  {blank && (
                    <p className="text-xs font-medium text-amber-800 md:col-span-2 dark:text-amber-200">
                      {t("blankFieldWarning")}
                    </p>
                  )}
                  <button
                    type="button"
                    className={`w-fit ${btn.danger}`}
                    onClick={() =>
                      edit({
                        ...selected,
                        details: selected.details.filter((_, detailIndex) => detailIndex !== index),
                      })
                    }
                  >
                    {t("removeField")}
                  </button>
                </div>
                );
              })}
            </div>
            {(error || Object.keys(fieldErrors).length > 0) && (
              <p role="alert" className="text-sm text-red-700 dark:text-red-300">
                {error || t("fixHighlighted")}
              </p>
            )}
            <p aria-live="polite" className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              {saved && !dirty ? t("saved") : ""}
            </p>
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

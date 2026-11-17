"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { StaffApiError, staffRequest } from "@/lib/staff/client";

export type PaymentDetail = {
  label_en: string;
  label_bn: string;
  value_en: string;
  value_bn: string;
};

export type PaymentMethod = {
  id: number;
  code: string;
  name_en: string;
  name_bn: string;
  is_active: boolean;
  order: number;
  details: PaymentDetail[];
};

export const emptyDetail = (): PaymentDetail => ({ label_en: "", label_bn: "", value_en: "", value_bn: "" });

export function usePaymentMethods() {
  const t = useTranslations("cms");
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [nameEn, setNameEn] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [queued, setQueued] = useState<PaymentMethod | null | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  function fail(err: unknown) {
    if (err instanceof StaffApiError) {
      setFieldErrors(err.fieldErrors);
      setError(err.message || (Object.keys(err.fieldErrors).length ? "" : t("error")));
      return;
    }
    setError(err instanceof Error && err.message ? err.message : t("error"));
  }

  function load(method: PaymentMethod | null) {
    setSelected(method);
    setDirty(false);
    setSaved(false);
    setError("");
    setFieldErrors({});
  }

  function open(method: PaymentMethod | null) {
    if (dirty) {
      setQueued(method);
      return;
    }
    load(method);
  }

  function edit(next: PaymentMethod) {
    setSelected(next);
    setDirty(true);
    setSaved(false);
  }

  async function reload() {
    const data = await staffRequest<PaymentMethod[]>("/api/staff/methods/");
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
      const created = await staffRequest<PaymentMethod>("/api/staff/methods/", {
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

  function updateDetail(index: number, key: keyof PaymentDetail, value: string) {
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
      const updated = await staffRequest<PaymentMethod>(`/api/staff/methods/${selected.id}/`, {
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

  return {
    t,
    methods,
    selected,
    nameEn,
    setNameEn,
    nameBn,
    setNameBn,
    saving,
    saved,
    dirty,
    error,
    fieldErrors,
    queued,
    setQueued,
    loaded,
    open,
    load,
    edit,
    addMethod,
    updateDetail,
    save,
    remove,
  };
}

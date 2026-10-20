"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/staff/ConfirmDialog";
import { btn } from "@/components/staff/buttons";
import { fieldClass } from "@/lib/cms";
import { staffRequest } from "@/lib/staff";

type ClassFee = {
  grade_id: number | null;
  slug: string;
  name_en: string;
  name_bn: string;
  amount: string;
};

export function ClassFeeEditor() {
  const t = useTranslations("staff");
  const tc = useTranslations("cms");
  const locale = useLocale();
  const [fees, setFees] = useState<ClassFee[] | null>(null);
  const [nameEn, setNameEn] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pendingRemove, setPendingRemove] = useState<number | null>(null);

  useEffect(() => {
    staffRequest<{ fees: ClassFee[] }>("/api/admissions/staff/class-fees/")
      .then((data) => setFees(data.fees))
      .catch(() => setError(t("feesError")));
  }, [t]);

  function setAmount(index: number, amount: string) {
    setFees((current) =>
      current?.map((fee, feeIndex) => (feeIndex === index ? { ...fee, amount } : fee)) ?? null
    );
    setSaved(false);
  }

  async function save() {
    if (!fees) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const updated = await staffRequest<{ fees: ClassFee[] }>("/api/admissions/staff/class-fees/", {
        method: "PUT",
        body: JSON.stringify({
          fees: fees.map((fee) => ({ grade_id: fee.grade_id, amount: fee.amount })),
        }),
      });
      setFees(updated.fees);
      setSaved(true);
    } catch {
      setError(t("feesError"));
    } finally {
      setSaving(false);
    }
  }

  async function addClass() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const updated = await staffRequest<{ fees: ClassFee[] }>("/api/admissions/staff/class-fees/", {
        method: "POST",
        body: JSON.stringify({ name_en: nameEn, name_bn: nameBn, amount: newAmount }),
      });
      setFees(updated.fees);
      setNameEn("");
      setNameBn("");
      setNewAmount("");
      setSaved(true);
    } catch {
      setError(t("feesError"));
    } finally {
      setSaving(false);
    }
  }

  async function removeClass(gradeId: number) {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const updated = await staffRequest<{ fees: ClassFee[] }>(
        `/api/admissions/staff/class-fees/?grade_id=${gradeId}`,
        { method: "DELETE" }
      );
      setFees(updated.fees);
    } catch {
      setError(t("feesError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-igqs-gold/25 bg-white p-5 dark:bg-[#0d1f18]">
      <h2 className="font-display text-2xl">{t("addClass")}</h2>
      <p className="mt-1 text-sm text-igqs-muted">{t("classFeesHint")}</p>
      <form
        className="mt-4 grid gap-3 md:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          void addClass();
        }}
      >
        <label className="text-sm">
          {t("classNameEn")}
          <input className={`${fieldClass} mt-1`} value={nameEn} onChange={(event) => setNameEn(event.currentTarget.value)} required />
        </label>
        <label className="text-sm">
          {t("classNameBn")}
          <input className={`${fieldClass} mt-1`} value={nameBn} onChange={(event) => setNameBn(event.currentTarget.value)} required />
        </label>
        <label className="text-sm">
          {t("classFeeAmount")}
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            className={`${fieldClass} mt-1`}
            value={newAmount}
            onChange={(event) => setNewAmount(event.currentTarget.value)}
            required
          />
        </label>
        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={saving}
            className={btn.primary}
          >
            {t("addClassAction")}
          </button>
        </div>
      </form>

      {!fees ? (
        <p className="mt-6 text-sm text-igqs-muted">{error || t("loading")}</p>
      ) : (
        <form
          className="mt-8 border-t border-igqs-gold/20 pt-6"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fees.map((fee, index) => {
              const name = fee.grade_id == null ? t("defaultFee") : locale === "bn" ? fee.name_bn : fee.name_en;
              return (
                <div key={fee.slug || "default"} className="text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span>{name}</span>
                    {fee.grade_id != null && (
                      <button
                        type="button"
                        className={btn.danger}
                        disabled={saving}
                        onClick={() => setPendingRemove(fee.grade_id as number)}
                      >
                        {t("removeClass")}
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className={`${fieldClass} mt-1`}
                    value={fee.amount}
                    placeholder="BDT"
                    onChange={(event) => setAmount(index, event.currentTarget.value)}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className={btn.primary}
            >
              {saving ? t("savingFees") : t("saveFees")}
            </button>
            {saved && <span className="text-sm text-emerald-700">{t("feesSaved")}</span>}
            {error && <span className="text-sm text-red-700">{error}</span>}
          </div>
        </form>
      )}
      <ConfirmDialog
        open={pendingRemove !== null}
        title={tc("confirmTitle")}
        message={tc("confirmDelete")}
        confirmLabel={tc("delete")}
        cancelLabel={tc("cancel")}
        onCancel={() => setPendingRemove(null)}
        onConfirm={() => {
          const gradeId = pendingRemove;
          setPendingRemove(null);
          if (gradeId !== null) void removeClass(gradeId);
        }}
      />
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { StaffApplicationDetail } from "@/lib/staff/types";
import { staffRequest } from "@/lib/staff/client";

export function useStaffApplication(applicationId: string) {
  const t = useTranslations("staff");
  const ta = useTranslations("admission");
  const locale = useLocale();
  const router = useRouter();
  const [data, setData] = useState<StaffApplicationDetail | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const [saving, setSaving] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"approved" | "rejected" | "pending" | null>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const [editingReceipt, setEditingReceipt] = useState(false);
  const [receiptNotice, setReceiptNotice] = useState<"" | "saved" | "openError">("");

  useEffect(() => {
    setLoadError(false);
    staffRequest<StaffApplicationDetail>(
      `/api/admissions/staff/applications/${encodeURIComponent(applicationId)}/`
    )
      .then((detail) => {
        setData(detail);
        setReason(detail.rejection_reason || "");
      })
      .catch((err) => {
        if (err instanceof Error && err.message === "unauthorized") {
          router.replace("/login");
          return;
        }
        setLoadError(true);
      });
  }, [applicationId, router, reloadTick]);

  function askStatus(status: "approved" | "rejected" | "pending") {
    if (status === "rejected" && !reason.trim()) {
      setError(t("rejectionRequired"));
      reasonRef.current?.focus();
      return;
    }
    setError("");
    setPendingStatus(status);
  }

  const confirmMessage =
    pendingStatus === "approved"
      ? t("confirmApprove")
      : pendingStatus === "rejected"
        ? t("confirmReject")
        : t("confirmPending");

  async function changeStatus(status: "approved" | "rejected" | "pending") {
    setSaving(true);
    setError("");
    try {
      const updated = await staffRequest<StaffApplicationDetail>(
        `/api/admissions/staff/applications/${encodeURIComponent(applicationId)}/status/`,
        {
          method: "POST",
          body: JSON.stringify({
            status,
            rejection_reason: status === "rejected" ? reason : "",
          }),
        }
      );
      setData(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("statusError"));
    } finally {
      setSaving(false);
    }
  }

  return {
    t,
    ta,
    locale,
    data,
    setData,
    reason,
    setReason,
    error,
    setError,
    loadError,
    setReloadTick,
    saving,
    pendingStatus,
    setPendingStatus,
    reasonRef,
    editingReceipt,
    setEditingReceipt,
    receiptNotice,
    setReceiptNotice,
    askStatus,
    confirmMessage,
    changeStatus,
  };
}

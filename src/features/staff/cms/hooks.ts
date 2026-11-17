"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { CmsMeta } from "@/lib/cms/types";
import { StaffApiError, staffRequest } from "@/lib/staff/client";
import type { FieldErrors } from "./types";

export function useCmsCopy() {
  const t = useTranslations("cms");
  return {
    t,
    english: t("english"),
    bengali: t("bengali"),
    save: t("save"),
    saving: t("saving"),
    saved: t("saved"),
    remove: t("delete"),
    add: t("add"),
    error: t("error"),
  };
}

export function isUnauthorized(err: unknown) {
  return err instanceof Error && err.message === "unauthorized";
}

/** Splits a failed save into a form-level summary and per-field messages. */
export function readError(err: unknown, fallback: string): { message: string; fields: FieldErrors } {
  if (err instanceof StaffApiError) {
    const hasFields = Object.keys(err.fieldErrors).length > 0;
    return {
      message: err.message || (hasFields ? "" : fallback),
      fields: err.fieldErrors,
    };
  }
  if (err instanceof Error && err.message) return { message: err.message, fields: {} };
  return { message: fallback, fields: {} };
}

/** Warns before the browser throws away unsaved edits. Row-to-row switches
 *  inside an editor are guarded separately, with a dialog. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}

/** Shared save/load/dirty state for one record, whether it came from a
 *  singleton endpoint, a side list or its own page. */
export function useRecordState() {
  const [values, setValues] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const copy = useCmsCopy();

  const edit = useCallback((next: Record<string, unknown>) => {
    setValues(next);
    setDirty(true);
  }, []);

  const load = useCallback((next: Record<string, unknown> | null) => {
    setValues(next);
    setDirty(false);
    setSaved(false);
    setError("");
    setFieldErrors({});
  }, []);

  const fail = useCallback(
    (err: unknown) => {
      const parsed = readError(err, copy.error);
      setError(parsed.message);
      setFieldErrors(parsed.fields);
    },
    [copy.error]
  );

  const succeed = useCallback((next: Record<string, unknown>) => {
    setValues(next);
    setDirty(false);
    setSaved(true);
    setError("");
    setFieldErrors({});
  }, []);

  useUnsavedWarning(dirty);

  return {
    values,
    setValues,
    edit,
    load,
    fail,
    succeed,
    saving,
    setSaving,
    saved,
    dirty,
    error,
    fieldErrors,
  };
}

export function useMeta() {
  const [meta, setMeta] = useState<CmsMeta | null>(null);
  const [failed, setFailed] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setFailed(false);
    staffRequest<CmsMeta>("/api/staff/meta/")
      .then(setMeta)
      .catch(() => setFailed(true));
  }, [tick]);
  return { meta, failed, retry: () => setTick((value) => value + 1) };
}

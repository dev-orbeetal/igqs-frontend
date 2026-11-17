"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { CmsField } from "@/lib/cms/types";
import { requestBody } from "@/lib/cms/payload";
import { staffRequest } from "@/lib/staff/client";
import { LoadFailed, Loading } from "./CmsChrome";
import { isUnauthorized, useRecordState } from "./hooks";
import { RecordForm } from "./RecordForm";

export function SingletonBlock({ path, fields }: { path: string; fields: CmsField[] }) {
  const router = useRouter();
  const state = useRecordState();
  const [loadError, setLoadError] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    setLoadError(false);
    staffRequest<Record<string, unknown>>(path)
      .then((data) => {
        if (active) state.load(data);
      })
      .catch((err) => {
        if (!active) return;
        if (isUnauthorized(err)) {
          router.replace("/login");
          return;
        }
        setLoadError(true);
      });
    return () => {
      active = false;
    };
    // state.load is stable (useCallback with no deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick, router]);

  async function save() {
    if (!state.values) return;
    state.setSaving(true);
    try {
      const updated = await staffRequest<Record<string, unknown>>(path, {
        method: "PATCH",
        body: requestBody(fields, state.values),
      });
      state.succeed(updated);
    } catch (err) {
      if (isUnauthorized(err)) {
        router.replace("/login");
        return;
      }
      state.fail(err);
    } finally {
      state.setSaving(false);
    }
  }

  if (loadError) return <LoadFailed onRetry={() => setTick((value) => value + 1)} />;
  if (!state.values) return <Loading />;
  return (
    <RecordForm
      fields={fields}
      values={state.values}
      onChange={state.edit}
      onSubmit={save}
      saving={state.saving}
      saved={state.saved}
      dirty={state.dirty}
      error={state.error}
      fieldErrors={state.fieldErrors}
    />
  );
}

"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import type { CmsField } from "@/lib/cms/types";
import { emptyRecord, requestBody } from "@/lib/cms/payload";
import { fieldClass } from "@/lib/cms/styles";
import { staffRequest } from "@/lib/staff/client";
import { btn } from "@/components/ui/button-styles";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Breadcrumb, Card, LoadFailed, Loading } from "./CmsChrome";
import { isUnauthorized, useCmsCopy, useRecordState } from "./hooks";
import { RecordForm } from "./RecordForm";

function rowLabel(row: Record<string, unknown>, titleField: string) {
  const title = String(row[titleField] ?? "").trim();
  if (title) return title;
  const src = typeof row.image_src === "string" ? row.image_src : "";
  const name = src.split("/").pop()?.split("?")[0];
  return name || String(row.id);
}

export function CollectionBlock({
  path,
  query = "",
  fields,
  titleField,
  defaults,
  match,
}: {
  path: string;
  query?: string;
  fields: CmsField[];
  titleField: string;
  defaults?: Record<string, unknown>;
  match?: (row: Record<string, unknown>) => boolean;
}) {
  const copy = useCmsCopy();
  const router = useRouter();
  const state = useRecordState();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [listQuery, setListQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [tick, setTick] = useState(0);
  // A click on another row while the open form has unsaved edits used to
  // discard them without a word.
  const [queued, setQueued] = useState<Record<string, unknown> | null | undefined>(undefined);

  const reload = useCallback(async () => {
    const data = await staffRequest<Record<string, unknown>[]>(`${path}${query}`);
    setRows(data);
    setLoaded(true);
    setLoadError(false);
    return data;
  }, [path, query]);

  useEffect(() => {
    reload().catch((err) => {
      if (isUnauthorized(err)) {
        router.replace("/login");
        return;
      }
      setLoadError(true);
      setLoaded(true);
    });
  }, [reload, tick, router]);

  function open(row: Record<string, unknown> | null) {
    if (state.dirty) {
      setQueued(row);
      return;
    }
    state.load(row);
  }

  async function save() {
    if (!state.values) return;
    state.setSaving(true);
    try {
      const id = state.values.id;
      const updated = await staffRequest<Record<string, unknown>>(id ? `${path}${id}/` : path, {
        method: id ? "PATCH" : "POST",
        body: requestBody(fields, { ...defaults, ...state.values }),
      });
      state.succeed(updated);
      await reload();
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

  async function remove() {
    const id = state.values?.id;
    if (!id) return;
    state.setSaving(true);
    try {
      await staffRequest(`${path}${id}/`, { method: "DELETE" });
      state.load(null);
      await reload();
    } catch (err) {
      state.fail(err);
    } finally {
      state.setSaving(false);
    }
  }

  const scoped = match ? rows.filter(match) : rows;
  const visible = scoped.filter((row) =>
    rowLabel(row, titleField).toLowerCase().includes(listQuery.trim().toLowerCase())
  );
  const selectedId = state.values?.id;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(220px,280px)_1fr]">
      <div className="rounded-2xl border border-igqs-gold/20 bg-igqs-sand/40 p-3 dark:bg-white/[0.04]">
        <button
          type="button"
          onClick={() => open(emptyRecord(fields, defaults))}
          className={`${btn.primary} w-full min-h-11`}
        >
          {copy.add}
        </button>
        <label className="mt-3 block text-sm font-medium">
          {copy.t("searchList")}
          <input
            className={fieldClass}
            value={listQuery}
            onChange={(event) => setListQuery(event.currentTarget.value)}
          />
        </label>
        {loadError ? (
          <div className="mt-3">
            <LoadFailed onRetry={() => setTick((value) => value + 1)} />
          </div>
        ) : loaded && visible.length === 0 ? (
          <p className="mt-4 rounded-xl bg-white px-3 py-6 text-center text-sm text-igqs-muted dark:bg-[#10261e]">
            {copy.t("emptyList")}
          </p>
        ) : (
          <ul className="mt-3 max-h-[28rem] space-y-1 overflow-y-auto text-sm">
            {visible.map((row) => (
              <li key={String(row.id)}>
                <button
                  type="button"
                  aria-current={selectedId === row.id ? "true" : undefined}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left ${
                    selectedId === row.id
                      ? "bg-white font-semibold text-igqs-green shadow-sm dark:bg-[#10261e] dark:text-igqs-gold-soft"
                      : "hover:bg-white/80 dark:hover:bg-white/5"
                  }`}
                  onClick={() => open(row)}
                >
                  {typeof row.image_src === "string" && row.image_src ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin-only 32px thumbnail
                    <img src={row.image_src} alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded object-cover" />
                  ) : null}
                  <span className="min-w-0 truncate">{rowLabel(row, titleField)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {state.values ? (
        <RecordForm
          fields={fields}
          values={state.values}
          onChange={state.edit}
          onSubmit={save}
          onDelete={state.values.id ? remove : undefined}
          saving={state.saving}
          saved={state.saved}
          dirty={state.dirty}
          error={state.error}
          fieldErrors={state.fieldErrors}
        />
      ) : (
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-igqs-border-strong px-4 py-8 text-center text-sm text-igqs-muted dark:border-igqs-gold/70">
          {copy.t("chooseOrAdd")}
        </div>
      )}
      <ConfirmDialog
        open={queued !== undefined}
        title={copy.t("unsavedTitle")}
        message={copy.t("unsavedMessage")}
        confirmLabel={copy.t("discardChanges")}
        cancelLabel={copy.t("keepEditing")}
        onCancel={() => setQueued(undefined)}
        onConfirm={() => {
          const next = queued;
          setQueued(undefined);
          if (next !== undefined) state.load(next);
        }}
      />
    </div>
  );
}

type RowBadge = { label: string; status: string };

export function ItemTable({
  path,
  hrefBase,
  titleField,
  extra,
  badge,
  thumb,
  rowActions,
}: {
  path: string;
  hrefBase: string;
  titleField: string;
  extra?: (row: Record<string, unknown>) => string;
  badge?: (row: Record<string, unknown>) => RowBadge | null;
  thumb?: (row: Record<string, unknown>) => string;
  rowActions?: (
    row: Record<string, unknown>,
    patchRow: (next: Record<string, unknown>) => void,
  ) => ReactNode;
}) {
  const copy = useCmsCopy();
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [listQuery, setListQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setLoadError(false);
    staffRequest<Record<string, unknown>[]>(path)
      .then((data) => {
        setRows(data);
        setLoadError(false);
      })
      .catch((err) => {
        if (isUnauthorized(err)) {
          router.replace("/login");
          return;
        }
        setRows([]);
        setLoadError(true);
      })
      .finally(() => setLoaded(true));
  }, [path, tick, router]);

  const visible = rows.filter((row) => {
    const details = extra?.(row) ?? "";
    const haystack = `${String(row[titleField] || row.id)} ${details}`.toLowerCase();
    return haystack.includes(listQuery.trim().toLowerCase());
  });

  function patchRow(id: unknown, next: Record<string, unknown>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...next } : row)));
  }

  const empty = (
    <p className="rounded-2xl border border-dashed border-igqs-border-strong px-4 py-8 text-center text-sm text-igqs-muted dark:border-igqs-gold/70">
      {rows.length === 0 ? copy.t("emptyList") : copy.t("noMatches")}
    </p>
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="text-sm font-medium">
          {copy.t("searchList")}
          <input
            className={`${fieldClass} sm:min-w-64`}
            value={listQuery}
            onChange={(event) => setListQuery(event.currentTarget.value)}
          />
        </label>
        <Link href={`${hrefBase}/new`} className={`${btn.primary} min-h-11`}>
          {copy.add}
        </Link>
      </div>

      {loadError ? (
        <div className="mt-4">
          <LoadFailed onRetry={() => setTick((value) => value + 1)} />
        </div>
      ) : !loaded ? (
        <div className="mt-4">
          <Loading />
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-3 md:hidden">
            {visible.length === 0 && empty}
            {visible.map((row) => {
              const mark = badge?.(row);
              const photo = thumb?.(row);
              return (
                <article key={String(row.id)} className="rounded-2xl border border-igqs-gold/25 bg-white p-4 dark:bg-[#0d1f18]">
                  <div className="flex items-start gap-3">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin list thumbnail
                      <img src={photo} alt="" className="h-16 w-24 shrink-0 rounded-xl object-cover" />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-medium">{String(row[titleField] || row.id)}</p>
                        {mark && <StatusBadge status={mark.status} label={mark.label} />}
                      </div>
                      {extra && <p className="mt-1 text-sm text-igqs-muted">{extra(row)}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rowActions?.(row, (next) => patchRow(row.id, next))}
                    <Link href={`${hrefBase}/${row.id}`} className={`${btn.secondary} min-h-11`}>
                      {copy.t("edit")}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-4 hidden overflow-x-auto rounded-3xl border border-igqs-gold/25 bg-white dark:bg-[#0d1f18] md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-igqs-gold/20 text-xs uppercase tracking-[0.12em] text-igqs-label">
                <tr>
                  <th className="px-4 py-3">{copy.t("columnItem")}</th>
                  <th className="px-4 py-3">{copy.t("columnDetails")}</th>
                  <th className="px-4 py-3 text-right">{copy.t("edit")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const mark = badge?.(row);
                  const photo = thumb?.(row);
                  return (
                    <tr key={String(row.id)} className="border-t border-igqs-gold/10">
                      <td className="px-4 py-3 font-medium">
                        <span className="flex items-center gap-3">
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element -- admin list thumbnail
                            <img src={photo} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                          ) : null}
                          <span>{String(row[titleField] || row.id)}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex flex-wrap items-center gap-2">
                          {mark && <StatusBadge status={mark.status} label={mark.label} />}
                          <span className="text-igqs-muted">{extra?.(row)}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {rowActions?.(row, (next) => patchRow(row.id, next))}
                          <Link href={`${hrefBase}/${row.id}`} className={btn.secondary}>
                            {copy.t("edit")}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {visible.length === 0 && <div className="p-4">{empty}</div>}
          </div>
        </>
      )}
    </div>
  );
}

export function ItemEditor({
  path,
  fields,
  defaults,
  listHref,
  sectionLabel,
  cardId,
}: {
  path: string;
  fields: CmsField[];
  defaults: Record<string, unknown>;
  listHref: string;
  sectionLabel: string;
  cardId?: string;
}) {
  const copy = useCmsCopy();
  const router = useRouter();
  const state = useRecordState();
  const [loadError, setLoadError] = useState(false);
  const [tick, setTick] = useState(0);
  const isNew = path.endsWith("/new");
  const resource = path.replace(/\/new$/, "/");

  useEffect(() => {
    if (isNew) {
      state.load(emptyRecord(fields, defaults));
      return;
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick, isNew, router]);

  async function save() {
    if (!state.values) return;
    state.setSaving(true);
    try {
      const updated = await staffRequest<Record<string, unknown>>(isNew ? resource : path, {
        method: isNew ? "POST" : "PATCH",
        body: requestBody(fields, { ...defaults, ...state.values }),
      });
      state.succeed(updated);
      if (isNew && updated.id) {
        router.replace(`${listHref}/${updated.id}`);
      }
    } catch (err) {
      if (isUnauthorized(err)) {
        router.replace("/login");
        return;
      }
      // This used to be a bare `catch {}` that replaced DRF's per-field
      // messages with "Could not save." — the whole reason a rejected save
      // looked unfixable.
      state.fail(err);
    } finally {
      state.setSaving(false);
    }
  }

  async function remove() {
    if (isNew || !state.values?.id) return;
    state.setSaving(true);
    try {
      await staffRequest(path, { method: "DELETE" });
      router.replace(listHref);
    } catch (err) {
      state.fail(err);
      state.setSaving(false);
    }
  }

  if (loadError) {
    return <LoadFailed onRetry={() => setTick((value) => value + 1)} backHref={listHref} />;
  }
  if (!state.values) return <Loading />;

  const title = String(state.values.title_en || state.values.name_en || "").trim();
  const current = isNew ? copy.t("newItem") : title || copy.t("edit");

  return (
    <div>
      <Breadcrumb sectionLabel={sectionLabel} listHref={listHref} current={current} />
      <Card id={cardId} title={current}>
        <RecordForm
          fields={fields}
          values={state.values}
          onChange={state.edit}
          onSubmit={save}
          onDelete={isNew ? undefined : remove}
          saving={state.saving}
          saved={state.saved}
          dirty={state.dirty}
          error={state.error}
          fieldErrors={state.fieldErrors}
        />
      </Card>
    </div>
  );
}

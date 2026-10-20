"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  aboutFields,
  admissionInfoFields,
  albumFields,
  contactFields,
  documentFields,
  emptyRecord,
  eventFields,
  facilityFields,
  defaultFeeFields,
  fieldClass,
  gradeFields,
  highlightFields,
  homeFields,
  leaderFields,
  newsFields,
  requestBody,
  subjectFields,
  testimonialFields,
  whyFields,
  type CmsField,
  type CmsMeta,
} from "@/lib/cms";
import { StaffApiError, staffRequest } from "@/lib/staff";
import { btn } from "@/components/staff/buttons";
import { ConfirmDialog } from "@/components/staff/ConfirmDialog";
import { StatusBadge } from "@/components/staff/StatusBadge";
import { AlbumImages } from "@/components/staff/cms/album-images";
import { HeroSlideEditor } from "@/components/staff/cms/hero-slides";
import {
  CmsFields,
  FormActions,
  SectionNav,
  unplacedErrors,
  type FieldErrors,
} from "@/components/staff/cms/fields";
import { PaymentMethodsEditor } from "@/components/staff/cms/payment-methods";

function useCmsCopy() {
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

function isUnauthorized(err: unknown) {
  return err instanceof Error && err.message === "unauthorized";
}

/** Splits a failed save into a form-level summary and per-field messages. */
function readError(err: unknown, fallback: string): { message: string; fields: FieldErrors } {
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

function Loading() {
  const t = useTranslations("cms");
  return (
    <div className="grid gap-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t("loading")}</span>
      {[0, 1, 2].map((row) => (
        <div key={row} className="h-20 animate-pulse rounded-2xl bg-igqs-sand/60 dark:bg-white/5" />
      ))}
    </div>
  );
}

/** Every editor used to call `staffRequest(...).then(setState)` with no catch,
 *  so a failed or 404 GET left the page on "Loading…" for good. */
function LoadFailed({ onRetry, backHref }: { onRetry: () => void; backHref?: string }) {
  const tc = useTranslations("cms");
  return (
    <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
      <p>{tc("loadError")}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" className="font-semibold underline" onClick={onRetry}>
          {tc("retry")}
        </button>
        {backHref && (
          <Link href={backHref} className="font-semibold underline">
            ← {tc("backToList")}
          </Link>
        )}
      </div>
    </div>
  );
}

function FormError({ message, extra }: { message: string; extra?: [string, string][] }) {
  if (!message && !extra?.length) return null;
  return (
    <div
      role="alert"
      className="mt-4 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
    >
      {message && <p>{message}</p>}
      {extra?.map(([key, value]) => (
        <p key={key} className={message ? "mt-1" : ""}>
          <span className="font-semibold">{key}:</span> {value}
        </p>
      ))}
    </div>
  );
}

/** Warns before the browser throws away unsaved edits. Row-to-row switches
 *  inside an editor are guarded separately, with a dialog. */
function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}

function RecordForm({
  fields,
  values,
  onChange,
  onSubmit,
  onDelete,
  saving,
  saved,
  dirty,
  error,
  fieldErrors,
}: {
  fields: CmsField[];
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  saving: boolean;
  saved: boolean;
  dirty: boolean;
  error: string;
  fieldErrors: FieldErrors;
}) {
  const copy = useCmsCopy();
  const unplaced = unplacedErrors(fields, fieldErrors);
  const summary =
    error || (Object.keys(fieldErrors).length > 0 ? copy.t("fixHighlighted") : "");
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <CmsFields
        fields={fields}
        values={values}
        onChange={onChange}
        errors={fieldErrors}
        englishLabel={copy.english}
        bengaliLabel={copy.bengali}
      />
      <FormError message={summary} extra={unplaced} />
      <FormActions
        saving={saving}
        dirty={dirty}
        saveLabel={copy.save}
        savingLabel={copy.saving}
        savedLabel={copy.saved}
        deleteLabel={copy.remove}
        onDelete={onDelete}
        saved={saved}
      />
    </form>
  );
}

/** Shared save/load/dirty state for one record, whether it came from a
 *  singleton endpoint, a side list or its own page. */
function useRecordState() {
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

function SingletonBlock({ path, fields }: { path: string; fields: CmsField[] }) {
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

function rowLabel(row: Record<string, unknown>, titleField: string) {
  const title = String(row[titleField] ?? "").trim();
  if (title) return title;
  const src = typeof row.image_src === "string" ? row.image_src : "";
  const name = src.split("/").pop()?.split("?")[0];
  return name || String(row.id);
}

function CollectionBlock({
  path,
  query = "",
  fields,
  titleField,
  defaults,
}: {
  path: string;
  query?: string;
  fields: CmsField[];
  titleField: string;
  defaults?: Record<string, unknown>;
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

  const visible = rows.filter((row) =>
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

function Card({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="scroll-mt-16 rounded-3xl border border-igqs-gold/25 bg-white p-5 shadow-sm dark:bg-[#0d1f18] sm:p-6"
    >
      <h2 className="border-b border-igqs-gold/20 pb-3 font-display text-2xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Item editors sit on their own URL, where the shell header only shows the
 *  section name. This says which record is open and how to get back. */
function Breadcrumb({ sectionLabel, listHref, current }: { sectionLabel: string; listHref: string; current: string }) {
  const t = useTranslations("cms");
  return (
    <nav aria-label={t("breadcrumb")} className="mb-4 flex flex-wrap items-center gap-2 text-sm">
      <Link href={listHref} className="font-medium text-igqs-green underline dark:text-igqs-gold-soft">
        ← {sectionLabel}
      </Link>
      <span aria-hidden className="text-igqs-muted">
        /
      </span>
      <span className="min-w-0 truncate text-igqs-muted">{current}</span>
    </nav>
  );
}

function useMeta() {
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

export function HomeEditor() {
  const t = useTranslations("cms");
  const { meta } = useMeta();
  const roles = [
    { value: "guardian", label: t("fRoleGuardian") },
    { value: "student", label: t("fRoleStudent") },
  ];
  const sections = [
    { id: "hero-slides", label: t("heroSlides") },
    { id: "highlights", label: t("highlights") },
    { id: "home", label: t("home") },
    { id: "why-choose", label: t("whyChoose") },
    { id: "testimonials", label: t("testimonials") },
  ];
  return (
    <div>
      <SectionNav sections={sections} />
      <div className="space-y-6">
        <Card id="hero-slides" title={t("heroSlides")}>
          <HeroSlideEditor />
        </Card>
        <Card id="highlights" title={t("highlights")}>
          <CollectionBlock
            path="/api/staff/highlights/"
            fields={highlightFields(meta?.stat_icons ?? [])}
            titleField="label_en"
            defaults={{ icon: "users", order: 0, value: "" }}
          />
        </Card>
        <Card id="home" title={t("home")}>
          <SingletonBlock path="/api/staff/home/" fields={homeFields} />
        </Card>
        <Card id="why-choose" title={t("whyChoose")}>
          <CollectionBlock
            path="/api/staff/why-choose/"
            fields={whyFields(meta?.why_icons ?? [])}
            titleField="title_en"
            defaults={{ icon: "book-open", order: 0 }}
          />
        </Card>
        <Card id="testimonials" title={t("testimonials")}>
          <CollectionBlock
            path="/api/staff/testimonials/"
            fields={testimonialFields(roles)}
            titleField="name_en"
            defaults={{ role: "guardian", rating: 5, order: 0 }}
          />
        </Card>
      </div>
    </div>
  );
}

export function AboutEditor() {
  const t = useTranslations("cms");
  const sections = [
    { id: "about", label: t("about") },
    { id: "leadership", label: t("leadership") },
    { id: "facilities", label: t("facilities") },
  ];
  return (
    <div>
      <SectionNav sections={sections} />
      <div className="space-y-6">
        <Card id="about" title={t("about")}>
          <SingletonBlock path="/api/staff/about/" fields={aboutFields} />
        </Card>
        <Card id="leadership" title={t("leadership")}>
          <CollectionBlock path="/api/staff/leaders/" fields={leaderFields} titleField="name_en" defaults={{ order: 0 }} />
        </Card>
        <Card id="facilities" title={t("facilities")}>
          <CollectionBlock
            path="/api/staff/facilities/"
            fields={facilityFields}
            titleField="title_en"
            defaults={{ order: 0 }}
          />
        </Card>
      </div>
    </div>
  );
}

export function ContactEditor() {
  const t = useTranslations("cms");
  return (
    <div>
      <Card title={t("contact")}>
        <SingletonBlock path="/api/staff/site/" fields={contactFields} />
      </Card>
    </div>
  );
}

export function AdmissionEditor() {
  const t = useTranslations("cms");
  const sections = [
    { id: "admission-info", label: t("admissionInfo") },
    { id: "default-fee", label: t("defaultFee") },
    { id: "payments", label: t("payments") },
  ];
  return (
    <div>
      <SectionNav sections={sections} />
      <div className="space-y-6">
        <Card id="admission-info" title={t("admissionInfo")}>
          <SingletonBlock path="/api/staff/site/" fields={admissionInfoFields} />
        </Card>
        <Card id="default-fee" title={t("defaultFee")}>
          <p className="-mt-2 mb-4 text-sm text-igqs-muted">{t("defaultFeeHint")}</p>
          <CollectionBlock
            path="/api/staff/fees/"
            fields={defaultFeeFields}
            titleField="label_en"
            defaults={{ currency: "BDT", is_active: true }}
          />
        </Card>
        <Card id="payments" title={t("payments")}>
          <PaymentMethodsEditor />
        </Card>
      </div>
    </div>
  );
}

type RowBadge = { label: string; status: string };

function ItemTable({
  path,
  hrefBase,
  titleField,
  extra,
  badge,
}: {
  path: string;
  hrefBase: string;
  titleField: string;
  extra?: (row: Record<string, unknown>) => string;
  badge?: (row: Record<string, unknown>) => RowBadge | null;
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
              return (
                <article key={String(row.id)} className="rounded-2xl border border-igqs-gold/25 bg-white p-4 dark:bg-[#0d1f18]">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">{String(row[titleField] || row.id)}</p>
                    {mark && <StatusBadge status={mark.status} label={mark.label} />}
                  </div>
                  {extra && <p className="mt-1 text-sm text-igqs-muted">{extra(row)}</p>}
                  <Link href={`${hrefBase}/${row.id}`} className={`${btn.secondary} mt-3 min-h-11`}>
                    {copy.t("edit")}
                  </Link>
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
                  return (
                    <tr key={String(row.id)} className="border-t border-igqs-gold/10">
                      <td className="px-4 py-3 font-medium">{String(row[titleField] || row.id)}</td>
                      <td className="px-4 py-3">
                        <span className="flex flex-wrap items-center gap-2">
                          {mark && <StatusBadge status={mark.status} label={mark.label} />}
                          <span className="text-igqs-muted">{extra?.(row)}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`${hrefBase}/${row.id}`} className={btn.secondary}>
                          {copy.t("edit")}
                        </Link>
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

function ItemEditor({
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

export function EventsManager({ id }: { id?: string }) {
  const t = useTranslations("cms");
  if (!id) {
    return (
      <ItemTable
        path="/api/staff/events/"
        hrefBase="/content/events"
        titleField="title_en"
        badge={(row) =>
          row.is_published
            ? { status: "approved", label: t("published") }
            : { status: "pending", label: t("draft") }
        }
        extra={(row) => String(row.location_en ?? "")}
      />
    );
  }
  return (
    <ItemEditor
      path={id === "new" ? "/api/staff/events/new" : `/api/staff/events/${id}/`}
      fields={eventFields}
      defaults={{ is_published: true }}
      listHref="/content/events"
      sectionLabel={t("events")}
    />
  );
}

export function NewsManager({ id }: { id?: string }) {
  const t = useTranslations("cms");
  const { meta } = useMeta();
  const fields = newsFields(meta?.news_categories ?? []);
  if (!id) {
    return (
      <ItemTable
        path="/api/staff/news/"
        hrefBase="/content/news"
        titleField="title_en"
        badge={(row) =>
          row.is_published
            ? { status: "approved", label: t("published") }
            : { status: "pending", label: t("draft") }
        }
        extra={(row) => `${row.category}${row.is_important ? ` · ${t("notice")}` : ""}`}
      />
    );
  }
  return (
    <ItemEditor
      path={id === "new" ? "/api/staff/news/new" : `/api/staff/news/${id}/`}
      fields={fields}
      defaults={{ category: "news", is_published: true, is_important: false, published_at: new Date().toISOString() }}
      listHref="/content/news"
      sectionLabel={t("news")}
    />
  );
}

export function CurriculumManager({ id }: { id?: string }) {
  const t = useTranslations("cms");
  const { meta } = useMeta();
  if (!id) {
    return (
      <ItemTable
        path="/api/staff/grades/"
        hrefBase="/content/curriculum"
        titleField="name_en"
        badge={(row) =>
          row.open_for_admission ? { status: "approved", label: t("admissionOpenBadge") } : null
        }
        extra={(row) => {
          const fee = row.fee_amount ? ` · ৳${String(row.fee_amount)}` : "";
          return `${String(row.slug)}${row.open_for_admission ? fee : ""}`;
        }}
      />
    );
  }
  const sections = [
    { id: "details", label: t("sectionDetails") },
    ...(id !== "new" ? [{ id: "subjects", label: t("subjects") }, { id: "documents", label: t("documents") }] : []),
  ];
  return (
    <div>
      <SectionNav sections={sections} />
      <div className="space-y-6">
        <ItemEditor
          cardId="details"
          path={id === "new" ? "/api/staff/grades/new" : `/api/staff/grades/${id}/`}
          fields={gradeFields}
          defaults={{ order: 0, listed_on_curriculum: true, open_for_admission: false }}
          listHref="/content/curriculum"
          sectionLabel={t("curriculum")}
        />
        {id !== "new" && meta && (
          <>
            <Card id="subjects" title={t("subjects")}>
              <CollectionBlock
                path="/api/staff/subjects/"
                query={`?grade=${id}`}
                fields={subjectFields(meta.subject_categories)}
                titleField="name_en"
                defaults={{ grade: Number(id), category: "general", order: 0 }}
              />
            </Card>
            <Card id="documents" title={t("documents")}>
              <CollectionBlock
                path="/api/staff/documents/"
                query={`?grade=${id}`}
                fields={documentFields}
                titleField="title_en"
                defaults={{ grade: Number(id), order: 0 }}
              />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export function GalleryManager({ id }: { id?: string }) {
  const t = useTranslations("cms");
  const { meta } = useMeta();
  const fields = albumFields(meta?.gallery_categories ?? []);
  if (!id) {
    return (
      <ItemTable
        path="/api/staff/albums/"
        hrefBase="/content/gallery"
        titleField="title_en"
        extra={(row) => String(row.category)}
      />
    );
  }
  const sections = [
    { id: "details", label: t("sectionDetails") },
    ...(id !== "new" ? [{ id: "images", label: t("images") }] : []),
  ];
  return (
    <div>
      <SectionNav sections={sections} />
      <div className="space-y-6">
        <ItemEditor
          cardId="details"
          path={id === "new" ? "/api/staff/albums/new" : `/api/staff/albums/${id}/`}
          fields={fields}
          defaults={{ category: "campus", order: 0 }}
          listHref="/content/gallery"
          sectionLabel={t("gallery")}
        />
        {id !== "new" && (
          <Card id="images" title={t("images")}>
            <AlbumImages albumId={id} />
          </Card>
        )}
      </div>
    </div>
  );
}

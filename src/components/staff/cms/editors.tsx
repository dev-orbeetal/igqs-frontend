"use client";

import { useEffect, useState } from "react";
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
  feeFields,
  gradeFields,
  homeFields,
  leaderFields,
  newsFields,
  requestBody,
  subjectFields,
  whyFields,
  type CmsField,
  type CmsMeta,
} from "@/lib/cms";
import { staffRequest } from "@/lib/staff";
import { AlbumImages } from "@/components/staff/cms/album-images";
import { CmsFields, FormActions } from "@/components/staff/cms/fields";
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

function RecordForm({
  fields,
  values,
  onChange,
  onSubmit,
  onDelete,
  saving,
  saved,
  error,
}: {
  fields: CmsField[];
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  saving: boolean;
  saved: boolean;
  error: string;
}) {
  const copy = useCmsCopy();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <CmsFields
        fields={fields}
        values={values}
        onChange={onChange}
        englishLabel={copy.english}
        bengaliLabel={copy.bengali}
      />
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <FormActions
        saving={saving}
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

function useSingleton(path: string) {
  const [values, setValues] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const copy = useCmsCopy();

  useEffect(() => {
    staffRequest<Record<string, unknown>>(path).then(setValues);
  }, [path]);

  async function save(fields: CmsField[]) {
    if (!values) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const updated = await staffRequest<Record<string, unknown>>(path, {
        method: "PATCH",
        body: requestBody(fields, values),
      });
      setValues(updated);
      setSaved(true);
    } catch {
      setError(copy.error);
    } finally {
      setSaving(false);
    }
  }

  return { values, setValues, saving, saved, error, save };
}

function SingletonBlock({ path, fields }: { path: string; fields: CmsField[] }) {
  const state = useSingleton(path);
  if (!state.values) return <Loading />;
  return (
    <RecordForm
      fields={fields}
      values={state.values}
      onChange={state.setValues}
      onSubmit={() => state.save(fields)}
      saving={state.saving}
      saved={state.saved}
      error={state.error}
    />
  );
}

function Loading() {
  const t = useTranslations("staff");
  return <p className="text-sm text-igqs-muted">{t("loading")}</p>;
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
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function reload() {
    const data = await staffRequest<Record<string, unknown>[]>(`${path}${query}`);
    setRows(data);
  }

  useEffect(() => {
    reload();
  }, [path, query]);

  function startNew() {
    setSelected(emptyRecord(fields, defaults));
    setSaved(false);
    setError("");
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const id = selected.id;
      const updated = await staffRequest<Record<string, unknown>>(
        id ? `${path}${id}/` : path,
        {
          method: id ? "PATCH" : "POST",
          body: requestBody(fields, { ...defaults, ...selected }),
        }
      );
      setSelected(updated);
      setSaved(true);
      await reload();
    } catch {
      setError(copy.error);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!selected?.id) return;
    setSaving(true);
    try {
      await staffRequest(`${path}${selected.id}/`, { method: "DELETE" });
      setSelected(null);
      await reload();
    } catch {
      setError(copy.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <div>
        <button type="button" onClick={startNew} className="text-sm text-igqs-gold underline">
          {copy.add}
        </button>
        <ul className="mt-3 space-y-1 text-sm">
          {rows.map((row) => (
            <li key={String(row.id)}>
              <button
                type="button"
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left ${
                  selected?.id === row.id ? "bg-igqs-gold/15 text-igqs-gold" : "hover:bg-igqs-gold/10"
                }`}
                onClick={() => {
                  setSelected(row);
                  setSaved(false);
                  setError("");
                }}
              >
                {typeof row.image_src === "string" && row.image_src ? (
                  <img src={row.image_src} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
                ) : null}
                <span className="min-w-0 truncate">{rowLabel(row, titleField)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {selected ? (
        <RecordForm
          fields={fields}
          values={selected}
          onChange={setSelected}
          onSubmit={save}
          onDelete={selected.id ? remove : undefined}
          saving={saving}
          saved={saved}
          error={error}
        />
      ) : (
        <p className="text-sm text-igqs-muted">{copy.t("chooseOrAdd")}</p>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-igqs-gold/25 bg-white p-6 dark:bg-[#0d1f18]">
      <h2 className="mb-5 font-display text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function useMeta() {
  const [meta, setMeta] = useState<CmsMeta | null>(null);
  useEffect(() => {
    staffRequest<CmsMeta>("/api/staff/meta/").then(setMeta);
  }, []);
  return meta;
}

export function ContentHub() {
  const t = useTranslations("cms");
  const sections = [
    { href: "/content/home", title: t("home"), hint: t("homeHint") },
    { href: "/content/about", title: t("about"), hint: t("aboutHint") },
    { href: "/content/curriculum", title: t("curriculum"), hint: t("curriculumHint") },
    { href: "/content/events", title: t("events"), hint: t("eventsHint") },
    { href: "/content/news", title: t("news"), hint: t("newsHint") },
    { href: "/content/gallery", title: t("gallery"), hint: t("galleryHint") },
    { href: "/content/contact", title: t("contact"), hint: t("contactHint") },
    { href: "/content/admission", title: t("admission"), hint: t("admissionHint") },
  ];
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.28em] text-igqs-gold">{t("kicker")}</p>
      <h1 className="mt-2 font-display text-4xl">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-igqs-muted">{t("subtitle")}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-3xl border border-igqs-gold/25 bg-white p-5 transition hover:border-igqs-gold dark:bg-[#0d1f18]"
          >
            <h2 className="font-display text-2xl">{section.title}</h2>
            <p className="mt-2 text-sm text-igqs-muted">{section.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function PageHeader({ title }: { title: string }) {
  const t = useTranslations("cms");
  return (
    <div className="mb-6">
      <Link href="/content" className="text-sm text-igqs-gold">
        ← {t("website")}
      </Link>
      <h1 className="mt-3 font-display text-4xl">{title}</h1>
    </div>
  );
}

export function HomeEditor() {
  const t = useTranslations("cms");
  const meta = useMeta();
  return (
    <div>
      <PageHeader title={t("home")} />
      <div className="space-y-6">
        <Card title={t("home")}>
          <SingletonBlock path="/api/staff/home/" fields={homeFields} />
        </Card>
        <Card title={t("whyChoose")}>
          <CollectionBlock
            path="/api/staff/why-choose/"
            fields={whyFields(meta?.why_icons ?? [])}
            titleField="title_en"
            defaults={{ icon: "book-open", order: 0 }}
          />
        </Card>
      </div>
    </div>
  );
}

export function AboutEditor() {
  const t = useTranslations("cms");
  return (
    <div>
      <PageHeader title={t("about")} />
      <div className="space-y-6">
        <Card title={t("about")}>
          <SingletonBlock path="/api/staff/about/" fields={aboutFields} />
        </Card>
        <Card title={t("leadership")}>
          <CollectionBlock path="/api/staff/leaders/" fields={leaderFields} titleField="name_en" defaults={{ order: 0 }} />
        </Card>
        <Card title={t("facilities")}>
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
      <PageHeader title={t("contact")} />
      <Card title={t("contact")}>
        <SingletonBlock path="/api/staff/site/" fields={contactFields} />
      </Card>
    </div>
  );
}

export function AdmissionEditor() {
  const t = useTranslations("cms");
  const meta = useMeta();
  const gradeOptions = [
    { value: "", label: t("defaultFee") },
    ...(meta?.grades ?? []).map((grade) => ({ value: String(grade.id), label: grade.name_en })),
  ];
  return (
    <div>
      <PageHeader title={t("admission")} />
      <div className="space-y-6">
        <Card title={t("admissionInfo")}>
          <SingletonBlock path="/api/staff/site/" fields={admissionInfoFields} />
        </Card>
        <Card title={t("fees")}>
          <CollectionBlock
            path="/api/staff/fees/"
            fields={feeFields(gradeOptions)}
            titleField="label_en"
            defaults={{ currency: "BDT", is_active: true, amount: 0 }}
          />
        </Card>
        <Card title={t("payments")}>
          <PaymentMethodsEditor />
        </Card>
      </div>
    </div>
  );
}

function ItemTable({
  path,
  hrefBase,
  titleField,
  extra,
}: {
  path: string;
  hrefBase: string;
  titleField: string;
  extra?: (row: Record<string, unknown>) => string;
}) {
  const copy = useCmsCopy();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  useEffect(() => {
    staffRequest<Record<string, unknown>[]>(path).then(setRows);
  }, [path]);
  return (
    <div>
      <Link href={`${hrefBase}/new`} className="text-sm text-igqs-gold underline">
        {copy.add}
      </Link>
      <div className="mt-4 overflow-x-auto rounded-3xl border border-igqs-gold/25 bg-white dark:bg-[#0d1f18]">
        <table className="min-w-full text-left text-sm">
          <tbody>
            {rows.map((row) => (
              <tr key={String(row.id)} className="border-t border-igqs-gold/10 first:border-t-0">
                <td className="px-4 py-3">{String(row[titleField] || row.id)}</td>
                <td className="px-4 py-3 text-igqs-muted">{extra?.(row)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`${hrefBase}/${row.id}`} className="text-igqs-gold underline">
                    {copy.t("edit")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ItemEditor({
  path,
  fields,
  defaults,
  listHref,
}: {
  path: string;
  fields: CmsField[];
  defaults: Record<string, unknown>;
  listHref: string;
}) {
  const copy = useCmsCopy();
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const isNew = path.endsWith("/new");
  const resource = path.replace(/\/new$/, "/");

  useEffect(() => {
    if (isNew) {
      setValues(emptyRecord(fields, defaults));
      return;
    }
    staffRequest<Record<string, unknown>>(path).then(setValues);
  }, [path]);

  async function save() {
    if (!values) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const updated = await staffRequest<Record<string, unknown>>(isNew ? resource : path, {
        method: isNew ? "POST" : "PATCH",
        body: requestBody(fields, { ...defaults, ...values }),
      });
      setValues(updated);
      setSaved(true);
      if (isNew && updated.id) {
        router.replace(`${listHref}/${updated.id}`);
      }
    } catch {
      setError(copy.error);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (isNew || !values?.id) return;
    setSaving(true);
    try {
      await staffRequest(path, { method: "DELETE" });
      router.replace(listHref);
    } catch {
      setError(copy.error);
      setSaving(false);
    }
  }

  if (!values) return <Loading />;
  return (
    <Card title={String(values.title_en || values.name_en || copy.t("edit"))}>
      <RecordForm
        fields={fields}
        values={values}
        onChange={setValues}
        onSubmit={save}
        onDelete={isNew ? undefined : remove}
        saving={saving}
        saved={saved}
        error={error}
      />
    </Card>
  );
}

export function EventsManager({ id }: { id?: string }) {
  const t = useTranslations("cms");
  if (!id) {
    return (
      <div>
        <PageHeader title={t("events")} />
        <ItemTable
          path="/api/staff/events/"
          hrefBase="/content/events"
          titleField="title_en"
          extra={(row) => (row.is_published ? t("published") : t("draft"))}
        />
      </div>
    );
  }
  return (
    <div>
      <PageHeader title={t("events")} />
      <ItemEditor
        path={id === "new" ? "/api/staff/events/new" : `/api/staff/events/${id}/`}
        fields={eventFields}
        defaults={{ is_published: true }}
        listHref="/content/events"
      />
    </div>
  );
}

export function NewsManager({ id }: { id?: string }) {
  const t = useTranslations("cms");
  const meta = useMeta();
  const fields = newsFields(meta?.news_categories ?? []);
  if (!id) {
    return (
      <div>
        <PageHeader title={t("news")} />
        <ItemTable
          path="/api/staff/news/"
          hrefBase="/content/news"
          titleField="title_en"
          extra={(row) => `${row.category}${row.is_important ? ` · ${t("notice")}` : ""}`}
        />
      </div>
    );
  }
  return (
    <div>
      <PageHeader title={t("news")} />
      <ItemEditor
        path={id === "new" ? "/api/staff/news/new" : `/api/staff/news/${id}/`}
        fields={fields}
        defaults={{ category: "news", is_published: true, is_important: false, published_at: new Date().toISOString() }}
        listHref="/content/news"
      />
    </div>
  );
}

export function CurriculumManager({ id }: { id?: string }) {
  const t = useTranslations("cms");
  const meta = useMeta();
  if (!id) {
    return (
      <div>
        <PageHeader title={t("curriculum")} />
        <ItemTable path="/api/staff/grades/" hrefBase="/content/curriculum" titleField="name_en" extra={(row) => String(row.slug)} />
      </div>
    );
  }
  return (
    <div>
      <PageHeader title={t("curriculum")} />
      <div className="space-y-6">
        <ItemEditor
          path={id === "new" ? "/api/staff/grades/new" : `/api/staff/grades/${id}/`}
          fields={gradeFields}
          defaults={{ order: 0 }}
          listHref="/content/curriculum"
        />
        {id !== "new" && meta && (
          <>
            <Card title={t("subjects")}>
              <CollectionBlock
                path="/api/staff/subjects/"
                query={`?grade=${id}`}
                fields={subjectFields(meta.subject_categories)}
                titleField="name_en"
                defaults={{ grade: Number(id), category: "general", order: 0 }}
              />
            </Card>
            <Card title={t("documents")}>
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
  const meta = useMeta();
  const fields = albumFields(meta?.gallery_categories ?? []);
  if (!id) {
    return (
      <div>
        <PageHeader title={t("gallery")} />
        <ItemTable
          path="/api/staff/albums/"
          hrefBase="/content/gallery"
          titleField="title_en"
          extra={(row) => String(row.category)}
        />
      </div>
    );
  }
  return (
    <div>
      <PageHeader title={t("gallery")} />
      <div className="space-y-6">
        <ItemEditor
          path={id === "new" ? "/api/staff/albums/new" : `/api/staff/albums/${id}/`}
          fields={fields}
          defaults={{ category: "campus", order: 0 }}
          listHref="/content/gallery"
        />
        {id !== "new" && (
          <Card title={t("images")}>
            <AlbumImages albumId={id} />
          </Card>
        )}
      </div>
    </div>
  );
}

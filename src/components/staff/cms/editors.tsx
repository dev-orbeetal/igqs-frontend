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
import { staffRequest } from "@/lib/staff";
import { btn } from "@/components/staff/buttons";
import { AlbumImages } from "@/components/staff/cms/album-images";
import { HeroSlideEditor } from "@/components/staff/cms/hero-slides";
import { CmsFields, FormActions, SectionNav } from "@/components/staff/cms/fields";
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
      {error && (
        <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}
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
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : copy.error);
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
  const [listQuery, setListQuery] = useState("");
  const [loaded, setLoaded] = useState(false);

  async function reload() {
    const data = await staffRequest<Record<string, unknown>[]>(`${path}${query}`);
    setRows(data);
    setLoaded(true);
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
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : copy.error);
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

  const visible = rows.filter((row) =>
    rowLabel(row, titleField).toLowerCase().includes(listQuery.trim().toLowerCase())
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(220px,280px)_1fr]">
      <div className="rounded-2xl border border-igqs-gold/20 bg-igqs-sand/40 p-3 dark:bg-white/[0.04]">
        <button type="button" onClick={startNew} className={`${btn.primary} w-full min-h-11`}>
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
        {loaded && visible.length === 0 ? (
          <p className="mt-4 rounded-xl bg-white px-3 py-6 text-center text-sm text-igqs-muted dark:bg-[#10261e]">
            {copy.t("emptyList")}
          </p>
        ) : (
        <ul className="mt-3 max-h-[28rem] space-y-1 overflow-y-auto text-sm">
          {visible.map((row) => (
            <li key={String(row.id)}>
              <button
                type="button"
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left ${
                  selected?.id === row.id
                    ? "bg-white font-semibold text-igqs-green shadow-sm dark:bg-[#10261e] dark:text-igqs-gold-soft"
                    : "hover:bg-white/80 dark:hover:bg-white/5"
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
        )}
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
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-igqs-gold/40 px-4 py-8 text-center text-sm text-igqs-muted">
          {copy.t("chooseOrAdd")}
        </div>
      )}
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

function useMeta() {
  const [meta, setMeta] = useState<CmsMeta | null>(null);
  useEffect(() => {
    staffRequest<CmsMeta>("/api/staff/meta/").then(setMeta);
  }, []);
  return meta;
}

export function HomeEditor() {
  const t = useTranslations("cms");
  const meta = useMeta();
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
            fields={testimonialFields}
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
            defaults={{ currency: "BDT", is_active: true, amount: 0 }}
          />
        </Card>
        <Card id="payments" title={t("payments")}>
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
  const [listQuery, setListQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    staffRequest<Record<string, unknown>[]>(path)
      .then(setRows)
      .finally(() => setLoaded(true));
  }, [path]);
  const visible = rows.filter((row) => {
    const details = extra?.(row) ?? "";
    const haystack = `${String(row[titleField] || row.id)} ${details}`.toLowerCase();
    return haystack.includes(listQuery.trim().toLowerCase());
  });
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
      <div className="mt-4 space-y-3 md:hidden">
        {loaded && visible.length === 0 && (
          <p className="rounded-2xl border border-dashed border-igqs-gold/40 px-4 py-8 text-center text-sm text-igqs-muted">
            {copy.t("emptyList")}
          </p>
        )}
        {visible.map((row) => (
          <article key={String(row.id)} className="rounded-2xl border border-igqs-gold/25 bg-white p-4 dark:bg-[#0d1f18]">
            <p className="font-medium">{String(row[titleField] || row.id)}</p>
            {extra && <p className="mt-1 text-sm text-igqs-muted">{extra(row)}</p>}
            <Link href={`${hrefBase}/${row.id}`} className={`${btn.secondary} mt-3 min-h-11`}>
              {copy.t("edit")}
            </Link>
          </article>
        ))}
      </div>
      <div className="mt-4 hidden overflow-x-auto rounded-3xl border border-igqs-gold/25 bg-white dark:bg-[#0d1f18] md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-igqs-gold/20 text-xs uppercase tracking-[0.12em] text-igqs-gold">
            <tr>
              <th className="px-4 py-3">{copy.t("columnItem")}</th>
              <th className="px-4 py-3">{copy.t("columnDetails")}</th>
              <th className="px-4 py-3 text-right">{copy.t("edit")}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={String(row.id)} className="border-t border-igqs-gold/10">
                <td className="px-4 py-3 font-medium">{String(row[titleField] || row.id)}</td>
                <td className="px-4 py-3 text-igqs-muted">{extra?.(row)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`${hrefBase}/${row.id}`} className={btn.secondary}>
                    {copy.t("edit")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loaded && visible.length === 0 && <p className="px-4 py-8 text-center text-sm text-igqs-muted">{copy.t("emptyList")}</p>}
      </div>
    </div>
  );
}

function ItemEditor({
  path,
  fields,
  defaults,
  listHref,
  cardId,
}: {
  path: string;
  fields: CmsField[];
  defaults: Record<string, unknown>;
  listHref: string;
  cardId?: string;
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
    <Card id={cardId} title={String(values.title_en || values.name_en || copy.t("edit"))}>
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
        <ItemTable
          path="/api/staff/grades/"
          hrefBase="/content/curriculum"
          titleField="name_en"
          extra={(row) => {
            if (!row.open_for_admission) return String(row.slug);
            const fee = row.fee_amount ? ` · ৳${String(row.fee_amount)}` : "";
            return `${String(row.slug)} · ${t("admissionOpenBadge")}${fee}`;
          }}
        />
      </div>
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
  const meta = useMeta();
  const fields = albumFields(meta?.gallery_categories ?? []);
  if (!id) {
    return (
      <div>
        <ItemTable
          path="/api/staff/albums/"
          hrefBase="/content/gallery"
          titleField="title_en"
          extra={(row) => String(row.category)}
        />
      </div>
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

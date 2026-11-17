"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { documentFields, gradeFields, subjectFields } from "@/lib/cms/fields";
import { staffRequest } from "@/lib/staff/client";
import { btn } from "@/components/ui/button-styles";
import { SectionNav } from "./CmsFields";
import { Card, Loading } from "./CmsChrome";
import { CollectionBlock, ItemEditor, ItemTable } from "./CollectionBlock";
import { isUnauthorized, useMeta } from "./hooks";
import { type CurriculumPanel } from "./panels";

function GradeAdmissionToggle({
  row,
  onUpdated,
}: {
  row: Record<string, unknown>;
  onUpdated: (next: Record<string, unknown>) => void;
}) {
  const t = useTranslations("cms");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const open = Boolean(row.open_for_admission);

  async function toggle() {
    setBusy(true);
    setError(false);
    try {
      const updated = await staffRequest<Record<string, unknown>>(`/api/staff/grades/${row.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ open_for_admission: !open }),
      });
      onUpdated(updated);
    } catch (err) {
      if (isUnauthorized(err)) {
        router.replace("/login");
        return;
      }
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-stretch gap-1 sm:items-end">
      <button
        type="button"
        disabled={busy}
        onClick={toggle}
        className={`${open ? btn.secondary : btn.primary} min-h-11 whitespace-nowrap`}
        aria-pressed={open}
      >
        {busy ? t("saving") : open ? t("admissionCloseAction") : t("admissionOpenAction")}
      </button>
      {error && <span className="text-xs text-red-600 dark:text-red-300">{t("admissionToggleError")}</span>}
    </span>
  );
}

export function CurriculumManager({ id, panel }: { id?: string; panel?: CurriculumPanel }) {
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
        rowActions={(row, patchRow) => (
          <GradeAdmissionToggle row={row} onUpdated={patchRow} />
        )}
      />
    );
  }
  const base = `/content/curriculum/${id}`;
  const current = panel ?? "details";
  const sections = [
    { id: "details", label: t("sectionDetails"), href: base },
    ...(id !== "new"
      ? [
          { id: "subjects", label: t("subjects"), href: `${base}/subjects` },
          { id: "documents", label: t("documents"), href: `${base}/documents` },
        ]
      : []),
  ];
  return (
    <div>
      <SectionNav sections={sections} />
      <div className="space-y-6">
        {current === "details" && (
          <ItemEditor
            cardId="details"
            path={id === "new" ? "/api/staff/grades/new" : `/api/staff/grades/${id}/`}
            fields={gradeFields}
            defaults={{ order: 0, listed_on_curriculum: true, open_for_admission: false }}
            listHref="/content/curriculum"
            sectionLabel={t("curriculum")}
          />
        )}
        {current === "subjects" && id !== "new" && (
          meta ? (
            <Card id="subjects" title={t("subjects")}>
              <CollectionBlock
                path="/api/staff/subjects/"
                query={`?grade=${id}`}
                fields={subjectFields(meta.subject_categories)}
                titleField="name_en"
                defaults={{ grade: Number(id), category: "general", order: 0 }}
              />
            </Card>
          ) : (
            <Loading />
          )
        )}
        {current === "documents" && id !== "new" && (
          <Card id="documents" title={t("documents")}>
            <CollectionBlock
              path="/api/staff/documents/"
              query={`?grade=${id}`}
              fields={documentFields}
              titleField="title_en"
              defaults={{ grade: Number(id), order: 0 }}
            />
          </Card>
        )}
      </div>
    </div>
  );
}

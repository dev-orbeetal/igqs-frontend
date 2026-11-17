"use client";

import type { CmsField } from "@/lib/cms/types";
import { FormError } from "./CmsChrome";
import { CmsFields, FormActions, unplacedErrors } from "./CmsFields";
import { useCmsCopy } from "./hooks";
import type { FieldErrors } from "./types";

export function RecordForm({
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

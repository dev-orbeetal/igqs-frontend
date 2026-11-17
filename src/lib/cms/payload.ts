import type { CmsField } from "@/lib/cms/types";

/** Every key a field writes to, so a form can tell dirty from pristine and
 *  match a server field error back to the control that caused it. */
export function fieldKeys(field: CmsField): string[] {
  if (field.type === "pair") return [`${field.name}_en`, `${field.name}_bn`];
  if (field.type === "image" || field.type === "file") {
    return [field.name, field.fileName, `clear_${field.fileName}`];
  }
  return [field.name];
}

export function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDateTimeLocal(value: string) {
  if (!value) return "";
  return new Date(value).toISOString();
}

const uploadKeys = new Set([
  "hero_image",
  "principal_photo",
  "image",
  "photo",
  "logo",
  "featured_image",
  "cover_image",
  "file",
]);

export function preparePayload(fields: CmsField[], values: Record<string, unknown>) {
  const payload: Record<string, unknown> = { ...values };
  for (const key of [
    "id",
    "subjects",
    "documents",
    "images",
    "image_src",
    "logo_src",
    "download_url",
    "grade_name",
  ]) {
    delete payload[key];
  }
  for (const key of Object.keys(payload)) {
    if (uploadKeys.has(key) && !(payload[key] instanceof File)) delete payload[key];
  }
  for (const field of fields) {
    if (field.type === "datetime") {
      const raw = String(payload[field.name] ?? "");
      payload[field.name] = raw ? fromDateTimeLocal(raw) : null;
    }
    if (field.type === "select" && payload[field.name] === "") {
      payload[field.name] = null;
    }
    if (field.type === "number") {
      // Number("") is 0, so coercing on every keystroke turned an emptied box
      // into a real zero — on the admission fee that meant a ৳0 fee quietly
      // replacing the school default. Blank now means "leave it alone".
      const raw = String(payload[field.name] ?? "").trim();
      if (raw === "") delete payload[field.name];
      else payload[field.name] = Number(raw);
    }
    if (field.type === "decimal") {
      payload[field.name] = String(payload[field.name] ?? "").trim();
    }
  }
  if (payload.grade !== undefined && payload.grade !== null && payload.grade !== "") {
    payload.grade = Number(payload.grade);
  }
  return payload;
}

export function requestBody(fields: CmsField[], values: Record<string, unknown>) {
  const payload = preparePayload(fields, values);
  const files: { name: string; file: File }[] = [];
  const datetimes = new Set(fields.filter((field) => field.type === "datetime").map((field) => field.name));

  for (const field of fields) {
    if (field.type !== "image" && field.type !== "file") continue;
    const flag = `clear_${field.fileName}`;
    const file = values[field.fileName];
    delete payload[field.fileName];
    if (file instanceof File) {
      files.push({ name: field.fileName, file });
      delete payload[field.name];
      delete payload[flag];
    } else if (payload[flag] === true) {
      payload[field.name] = "";
    } else {
      delete payload[field.name];
      delete payload[flag];
    }
  }

  if (files.length === 0) return JSON.stringify(payload);

  const form = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if ((value === null || value === undefined) && datetimes.has(key)) continue;
    if (typeof value === "boolean") {
      form.append(key, value ? "true" : "false");
    } else if (value === null || value === undefined) {
      form.append(key, "");
    } else {
      form.append(key, String(value));
    }
  }
  for (const item of files) form.append(item.name, item.file);
  return form;
}

export function emptyRecord(fields: CmsField[], extras: Record<string, unknown> = {}) {
  const values: Record<string, unknown> = { ...extras };
  for (const field of fields) {
    if (field.type === "pair") {
      values[`${field.name}_en`] = extras[`${field.name}_en`] ?? "";
      values[`${field.name}_bn`] = extras[`${field.name}_bn`] ?? "";
    } else if (field.type === "checkbox") {
      values[field.name] = extras[field.name] ?? false;
    } else if (field.type === "number" || field.type === "decimal") {
      // Blank, not 0: a new class must not arrive with a ৳0 admission fee
      // just because nobody typed in the box.
      values[field.name] = extras[field.name] ?? "";
    } else if (extras[field.name] === undefined) {
      values[field.name] = "";
    }
  }
  return values;
}

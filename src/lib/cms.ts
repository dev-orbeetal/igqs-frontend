export type Option = { value: string; label: string };

export type CmsMeta = {
  grades: { id: number; slug: string; name_en: string }[];
  subject_categories: Option[];
  news_categories: Option[];
  gallery_categories: Option[];
  payment_codes: Option[];
  why_icons: Option[];
};

export type CmsField =
  | { type: "text" | "textarea" | "url" | "number"; name: string; label: string }
  | { type: "pair"; name: string; label: string; textarea?: boolean }
  | { type: "checkbox"; name: string; label: string }
  | { type: "select"; name: string; label: string; options: Option[] }
  | { type: "datetime"; name: string; label: string }
  | { type: "image"; name: string; fileName: string; label: string };

export const fieldClass =
  "mt-1 w-full rounded-xl border border-igqs-gold/30 bg-transparent px-3 py-2 text-sm";

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
  for (const field of fields) {
    if (field.type === "datetime") {
      const raw = String(payload[field.name] ?? "");
      payload[field.name] = raw ? fromDateTimeLocal(raw) : null;
    }
    if (field.type === "select" && payload[field.name] === "") {
      payload[field.name] = null;
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
    if (field.type !== "image") continue;
    const flag = `clear_${field.fileName}`;
    const file = values[field.fileName];
    delete payload[field.fileName];
    if (file instanceof File) {
      files.push({ name: field.fileName, file });
      payload[field.name] = "";
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
      values[`${field.name}_en`] = "";
      values[`${field.name}_bn`] = "";
    } else if (field.type === "checkbox") {
      values[field.name] = false;
    } else if (field.type === "number") {
      values[field.name] = 0;
    } else {
      values[field.name] = "";
    }
  }
  return values;
}

export const homeFields: CmsField[] = [
  { type: "pair", name: "hero_title", label: "Hero title" },
  { type: "pair", name: "hero_subtitle", label: "Hero subtitle", textarea: true },
  { type: "image", name: "hero_image_url", fileName: "hero_image", label: "Hero image" },
  { type: "pair", name: "welcome", label: "Welcome", textarea: true },
  { type: "pair", name: "about_preview", label: "About preview", textarea: true },
  { type: "pair", name: "principal_name", label: "Principal name" },
  { type: "pair", name: "principal_title", label: "Principal title" },
  { type: "pair", name: "principal_message", label: "Principal message", textarea: true },
  { type: "image", name: "principal_photo_url", fileName: "principal_photo", label: "Principal photo" },
];

export const whyFields = (icons: Option[]): CmsField[] => [
  { type: "pair", name: "title", label: "Title" },
  { type: "pair", name: "description", label: "Description", textarea: true },
  { type: "select", name: "icon", label: "Icon", options: icons },
  { type: "number", name: "order", label: "Order" },
];

export const aboutFields: CmsField[] = [
  { type: "pair", name: "introduction", label: "Introduction", textarea: true },
  { type: "pair", name: "vision", label: "Vision", textarea: true },
  { type: "pair", name: "mission", label: "Mission", textarea: true },
  { type: "pair", name: "history", label: "History", textarea: true },
  { type: "pair", name: "quranic_approach", label: "Qur'anic approach", textarea: true },
  { type: "pair", name: "principal_message", label: "Principal message", textarea: true },
];

export const leaderFields: CmsField[] = [
  { type: "pair", name: "name", label: "Name" },
  { type: "pair", name: "role", label: "Role" },
  { type: "pair", name: "bio", label: "Biography", textarea: true },
  { type: "image", name: "photo_url", fileName: "photo", label: "Photo" },
  { type: "number", name: "order", label: "Order" },
];

export const facilityFields: CmsField[] = [
  { type: "pair", name: "title", label: "Title" },
  { type: "pair", name: "description", label: "Description", textarea: true },
  { type: "image", name: "image_url", fileName: "image", label: "Image" },
  { type: "number", name: "order", label: "Order" },
];

export const contactFields: CmsField[] = [
  { type: "pair", name: "school_name", label: "School name" },
  { type: "pair", name: "tagline", label: "Tagline" },
  { type: "image", name: "logo_url", fileName: "logo", label: "Logo" },
  { type: "pair", name: "address", label: "Address" },
  { type: "text", name: "phone_primary", label: "Primary phone" },
  { type: "text", name: "phone_secondary", label: "Secondary phone" },
  { type: "text", name: "email", label: "Email" },
  { type: "pair", name: "office_hours", label: "Office hours" },
  { type: "url", name: "map_embed_url", label: "Map embed URL" },
  { type: "url", name: "facebook_url", label: "Facebook" },
  { type: "url", name: "youtube_url", label: "YouTube" },
  { type: "url", name: "instagram_url", label: "Instagram" },
  { type: "url", name: "whatsapp_url", label: "WhatsApp" },
];

export const admissionInfoFields: CmsField[] = [
  { type: "checkbox", name: "admission_open", label: "Admission is open" },
  { type: "pair", name: "admission_announcement", label: "Admission announcement", textarea: true },
];

export const eventFields: CmsField[] = [
  { type: "text", name: "slug", label: "Slug" },
  { type: "pair", name: "title", label: "Title" },
  { type: "datetime", name: "start_at", label: "Starts" },
  { type: "datetime", name: "end_at", label: "Ends" },
  { type: "pair", name: "location", label: "Location" },
  { type: "pair", name: "description", label: "Description", textarea: true },
  { type: "image", name: "image_url", fileName: "image", label: "Image" },
  { type: "checkbox", name: "is_published", label: "Published" },
];

export const newsFields = (categories: Option[]): CmsField[] => [
  { type: "text", name: "slug", label: "Slug" },
  { type: "pair", name: "title", label: "Title" },
  { type: "select", name: "category", label: "Category", options: categories },
  { type: "pair", name: "description", label: "Description", textarea: true },
  { type: "image", name: "featured_image_url", fileName: "featured_image", label: "Image" },
  { type: "datetime", name: "published_at", label: "Published at" },
  { type: "checkbox", name: "is_published", label: "Published" },
  { type: "checkbox", name: "is_important", label: "Show as important notice" },
];

export const gradeFields: CmsField[] = [
  { type: "text", name: "slug", label: "Slug" },
  { type: "pair", name: "name", label: "Name" },
  { type: "pair", name: "description", label: "Description", textarea: true },
  { type: "number", name: "order", label: "Order" },
];

export const subjectFields = (categories: Option[]): CmsField[] => [
  { type: "pair", name: "name", label: "Name" },
  { type: "select", name: "category", label: "Category", options: categories },
  { type: "pair", name: "description", label: "Description", textarea: true },
  { type: "number", name: "order", label: "Order" },
];

export const documentFields: CmsField[] = [
  { type: "pair", name: "title", label: "Title" },
  { type: "url", name: "file_url", label: "File URL" },
  { type: "number", name: "order", label: "Order" },
];

export const albumFields = (categories: Option[]): CmsField[] => [
  { type: "text", name: "slug", label: "Slug" },
  { type: "pair", name: "title", label: "Title" },
  { type: "select", name: "category", label: "Category", options: categories },
  { type: "pair", name: "description", label: "Description", textarea: true },
  { type: "image", name: "cover_image_url", fileName: "cover_image", label: "Cover image" },
  { type: "number", name: "order", label: "Order" },
];

export const feeFields = (grades: Option[]): CmsField[] => [
  { type: "select", name: "grade", label: "Class (empty = default fee)", options: grades },
  { type: "number", name: "amount", label: "Amount" },
  { type: "text", name: "currency", label: "Currency" },
  { type: "pair", name: "label", label: "Label" },
  { type: "checkbox", name: "is_active", label: "Active" },
];


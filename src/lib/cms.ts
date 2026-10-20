export type Option = { value: string; label: string };

export type CmsMeta = {
  grades: { id: number; slug: string; name_en: string }[];
  subject_categories: Option[];
  news_categories: Option[];
  gallery_categories: Option[];
  payment_codes: Option[];
  why_icons: Option[];
  stat_icons: Option[];
};

export type CmsField = { section?: string; hint?: string } & (
  | { type: "text" | "textarea" | "url" | "number"; name: string; label: string }
  | { type: "pair"; name: string; label: string; textarea?: boolean }
  | { type: "checkbox"; name: string; label: string }
  | { type: "select"; name: string; label: string; options: Option[] }
  | { type: "datetime"; name: string; label: string }
  | { type: "image"; name: string; fileName: string; label: string }
);

export const fieldClass =
  "mt-1.5 w-full min-h-11 rounded-xl border border-igqs-gold/40 bg-white px-3.5 py-2.5 text-sm text-igqs-ink shadow-sm outline-none transition placeholder:text-igqs-muted/80 focus:border-igqs-gold focus:ring-2 focus:ring-igqs-gold/30 dark:bg-[#10261e] dark:text-igqs-sand";

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
    } else if (field.type === "number") {
      values[field.name] = extras[field.name] ?? 0;
    } else if (extras[field.name] === undefined) {
      values[field.name] = "";
    }
  }
  return values;
}

export const homeFields: CmsField[] = [
  { type: "pair", name: "hero_title", label: "Hero title", section: "sectionHero" },
  { type: "pair", name: "hero_subtitle", label: "Hero subtitle", textarea: true, section: "sectionHero" },
  { type: "pair", name: "welcome", label: "Welcome", textarea: true, section: "sectionWelcome" },
  { type: "pair", name: "about_preview", label: "About preview", textarea: true, section: "sectionWelcome" },
  { type: "pair", name: "principal_name", label: "Principal name", section: "sectionPrincipal" },
  { type: "pair", name: "principal_title", label: "Principal title", section: "sectionPrincipal" },
  { type: "pair", name: "principal_message", label: "Principal message", textarea: true, section: "sectionPrincipal" },
  { type: "image", name: "principal_photo_url", fileName: "principal_photo", label: "Principal photo", section: "sectionPrincipal" },
];

export const highlightFields = (icons: Option[]): CmsField[] => [
  { type: "text", name: "value", label: "Value", hint: "statValueHint" },
  { type: "pair", name: "label", label: "Label" },
  { type: "select", name: "icon", label: "Icon", options: icons },
  { type: "number", name: "order", label: "Order" },
];

export const testimonialFields: CmsField[] = [
  { type: "pair", name: "name", label: "Name" },
  {
    type: "select",
    name: "role",
    label: "Who is speaking",
    options: [
      { value: "guardian", label: "Guardian" },
      { value: "student", label: "Student" },
    ],
  },
  { type: "pair", name: "quote", label: "Quote", textarea: true },
  { type: "datetime", name: "spoken_on", label: "Date" },
  { type: "number", name: "rating", label: "Stars (0–5)" },
  { type: "url", name: "facebook_url", label: "Facebook profile" },
  { type: "image", name: "image_url", fileName: "image", label: "Photo" },
  { type: "number", name: "order", label: "Order" },
];

export const whyFields = (icons: Option[]): CmsField[] => [
  { type: "pair", name: "title", label: "Title" },
  { type: "pair", name: "description", label: "Description", textarea: true },
  { type: "image", name: "image_url", fileName: "image", label: "Photo" },
  { type: "select", name: "icon", label: "Icon", options: icons },
  { type: "number", name: "order", label: "Order" },
];

export const aboutFields: CmsField[] = [
  { type: "pair", name: "introduction", label: "Introduction", textarea: true, section: "sectionStory" },
  { type: "pair", name: "history", label: "History", textarea: true, section: "sectionStory" },
  { type: "pair", name: "vision", label: "Vision", textarea: true, section: "sectionPurpose" },
  { type: "pair", name: "mission", label: "Mission", textarea: true, section: "sectionPurpose" },
  { type: "pair", name: "quranic_approach", label: "Qur'anic approach", textarea: true, section: "sectionPurpose" },
  { type: "pair", name: "principal_message", label: "Principal message", textarea: true, section: "sectionPrincipal" },
];

export const leaderFields: CmsField[] = [
  { type: "pair", name: "name", label: "Name", section: "sectionDetails" },
  { type: "pair", name: "role", label: "Role", section: "sectionDetails" },
  { type: "pair", name: "bio", label: "Biography", textarea: true, section: "sectionDetails" },
  { type: "image", name: "photo_url", fileName: "photo", label: "Photo", section: "sectionMedia" },
  { type: "number", name: "order", label: "Order", section: "sectionPublishing" },
];

export const facilityFields: CmsField[] = [
  { type: "pair", name: "title", label: "Title", section: "sectionDetails" },
  { type: "pair", name: "description", label: "Description", textarea: true, section: "sectionDetails" },
  { type: "image", name: "image_url", fileName: "image", label: "Image", section: "sectionMedia" },
  { type: "number", name: "order", label: "Order", section: "sectionPublishing" },
];

export const contactFields: CmsField[] = [
  { type: "pair", name: "school_name", label: "School name", section: "sectionIdentity" },
  { type: "pair", name: "tagline", label: "Tagline", section: "sectionIdentity" },
  { type: "image", name: "logo_url", fileName: "logo", label: "Logo", section: "sectionIdentity" },
  { type: "pair", name: "address", label: "Address", section: "sectionContact" },
  { type: "text", name: "phone_primary", label: "Primary phone", section: "sectionContact" },
  { type: "text", name: "phone_secondary", label: "Secondary phone", section: "sectionContact" },
  { type: "text", name: "email", label: "Email", section: "sectionContact" },
  { type: "pair", name: "office_hours", label: "Office hours", section: "sectionContact" },
  { type: "url", name: "map_embed_url", label: "Map embed URL", section: "sectionMap" },
  { type: "url", name: "facebook_url", label: "Facebook", section: "sectionSocial" },
  { type: "url", name: "youtube_url", label: "YouTube", section: "sectionSocial" },
  { type: "url", name: "instagram_url", label: "Instagram", section: "sectionSocial" },
  { type: "url", name: "whatsapp_url", label: "WhatsApp", section: "sectionSocial" },
];

export const admissionInfoFields: CmsField[] = [
  { type: "checkbox", name: "admission_open", label: "Admission is open" },
  { type: "pair", name: "admission_announcement", label: "Admission announcement", textarea: true },
];

export const eventFields: CmsField[] = [
  { type: "text", name: "slug", label: "Page link", hint: "slugHint", section: "sectionDetails" },
  { type: "pair", name: "title", label: "Title", section: "sectionDetails" },
  { type: "pair", name: "location", label: "Location", section: "sectionDetails" },
  { type: "pair", name: "description", label: "Description", textarea: true, section: "sectionDetails" },
  { type: "datetime", name: "start_at", label: "Starts", section: "sectionSchedule" },
  { type: "datetime", name: "end_at", label: "Ends", section: "sectionSchedule" },
  { type: "image", name: "image_url", fileName: "image", label: "Image", section: "sectionPublishing" },
  { type: "checkbox", name: "is_published", label: "Published", section: "sectionPublishing" },
];

export const newsFields = (categories: Option[]): CmsField[] => [
  { type: "text", name: "slug", label: "Page link", hint: "slugHint", section: "sectionDetails" },
  { type: "pair", name: "title", label: "Title", section: "sectionDetails" },
  { type: "select", name: "category", label: "Category", options: categories, section: "sectionDetails" },
  { type: "pair", name: "description", label: "Description", textarea: true, section: "sectionDetails" },
  { type: "image", name: "featured_image_url", fileName: "featured_image", label: "Image", section: "sectionMedia" },
  { type: "datetime", name: "published_at", label: "Published at", section: "sectionPublishing" },
  { type: "checkbox", name: "is_published", label: "Published", section: "sectionPublishing" },
  { type: "checkbox", name: "is_important", label: "Show as important notice", section: "sectionPublishing" },
];

export const gradeFields: CmsField[] = [
  { type: "text", name: "slug", label: "Page link", hint: "slugHint", section: "sectionDetails" },
  { type: "pair", name: "name", label: "Name", section: "sectionDetails" },
  { type: "pair", name: "description", label: "Description", textarea: true, section: "sectionDetails" },
  { type: "checkbox", name: "listed_on_curriculum", label: "Show on the public curriculum page", section: "sectionPublishing" },
  { type: "number", name: "order", label: "Order", section: "sectionPublishing" },
  { type: "checkbox", name: "open_for_admission", label: "Open for admission", section: "sectionAdmission" },
  { type: "number", name: "fee_amount", label: "Admission fee (BDT)", hint: "feeAmountHint", section: "sectionAdmission" },
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
  { type: "text", name: "slug", label: "Page link", hint: "slugHint", section: "sectionDetails" },
  { type: "pair", name: "title", label: "Title", section: "sectionDetails" },
  { type: "select", name: "category", label: "Category", options: categories, section: "sectionDetails" },
  { type: "pair", name: "description", label: "Description", textarea: true, section: "sectionDetails" },
  { type: "image", name: "cover_image_url", fileName: "cover_image", label: "Cover image", section: "sectionMedia" },
  { type: "number", name: "order", label: "Order", section: "sectionPublishing" },
];

// Per-class fees are set from the class's own editor (Curriculum page) now —
// this is only the default fee shown to applicants with no class-specific
// fee configured, so there's no grade selector here.
export const defaultFeeFields: CmsField[] = [
  { type: "number", name: "amount", label: "Amount" },
  { type: "text", name: "currency", label: "Currency" },
  { type: "pair", name: "label", label: "Label" },
  { type: "checkbox", name: "is_active", label: "Active" },
];


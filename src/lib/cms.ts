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

export type CmsField = { section?: string; hint?: string; required?: boolean } & (
  // "number" is a whole number (order, rating) and is omitted from the payload
  // when left blank, so the model default or the stored value stands.
  // "decimal" is a money amount held as a string all the way to the API, where
  // the matching serializer field is a CharField/DecimalField that accepts "".
  | { type: "text" | "textarea" | "url" | "number" | "decimal"; name: string; label: string }
  | { type: "pair"; name: string; label: string; textarea?: boolean }
  | { type: "checkbox"; name: string; label: string }
  | { type: "select"; name: string; label: string; options: Option[] }
  | { type: "datetime"; name: string; label: string }
  | { type: "image"; name: string; fileName: string; label: string }
  // A document (syllabus PDF and the like): same upload plumbing as "image",
  // without the thumbnail, and it accepts any file type.
  | { type: "file"; name: string; fileName: string; label: string; accept?: string }
);

/** Every key a field writes to, so a form can tell dirty from pristine and
 *  match a server field error back to the control that caused it. */
export function fieldKeys(field: CmsField): string[] {
  if (field.type === "pair") return [`${field.name}_en`, `${field.name}_bn`];
  if (field.type === "image" || field.type === "file") {
    return [field.name, field.fileName, `clear_${field.fileName}`];
  }
  return [field.name];
}

// border-igqs-gold/40 measured 1.39:1 against white — a field you cannot see
// the edge of. border-strong is the same hue at 3.95:1, matching the public
// site's form fields; gold/70 is 3.97:1 on the dark field background.
const fieldBase =
  "mt-1.5 w-full min-h-11 rounded-xl border bg-white px-3.5 py-2.5 text-sm text-igqs-ink shadow-sm outline-none transition placeholder:text-igqs-muted/80 focus:ring-2 focus:ring-igqs-gold/30 dark:bg-[#10261e] dark:text-igqs-sand";

export const fieldClass = `${fieldBase} border-igqs-border-strong focus:border-igqs-gold dark:border-igqs-gold/70`;

export const fieldClassInvalid = `${fieldBase} border-red-600 focus:border-red-600 dark:border-red-400`;

export function fieldClassFor(invalid?: boolean) {
  return invalid ? fieldClassInvalid : fieldClass;
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

// Labels are `cms` message keys, not literal text. The panel has a working
// EN/BN switcher, and leaving these as English strings meant a Bangla shell
// wrapped around an English form. `required` mirrors the serializers in
// content/staff_serializers.py — it is what the API will actually reject.

export const homeFields: CmsField[] = [
  { type: "pair", name: "hero_title", label: "fHeroTitle", required: true, section: "sectionHero" },
  { type: "pair", name: "hero_subtitle", label: "fHeroSubtitle", textarea: true, required: true, section: "sectionHero" },
  { type: "image", name: "hero_image_url", fileName: "hero_image", label: "fHeroImage", hint: "heroImageHint", section: "sectionHero" },
  { type: "pair", name: "welcome", label: "fWelcome", textarea: true, required: true, section: "sectionWelcome" },
  { type: "pair", name: "about_preview", label: "fAboutPreview", textarea: true, required: true, section: "sectionWelcome" },
  { type: "pair", name: "principal_name", label: "fPrincipalName", required: true, section: "sectionPrincipal" },
  { type: "pair", name: "principal_title", label: "fPrincipalTitle", required: true, section: "sectionPrincipal" },
  { type: "pair", name: "principal_message", label: "fPrincipalMessage", textarea: true, required: true, section: "sectionPrincipal" },
  { type: "image", name: "principal_photo_url", fileName: "principal_photo", label: "fPrincipalPhoto", section: "sectionPrincipal" },
];

export const highlightFields = (icons: Option[]): CmsField[] => [
  { type: "text", name: "value", label: "fValue", required: true, hint: "statValueHint" },
  { type: "pair", name: "label", label: "fLabel", required: true },
  { type: "select", name: "icon", label: "fIcon", options: icons },
  { type: "number", name: "order", label: "fOrder" },
];

// `roles` comes from the editor so the two option labels are translated like
// everything else; the category/icon factories take their options the same way.
export const testimonialFields = (roles: Option[]): CmsField[] => [
  { type: "pair", name: "name", label: "fName", required: true },
  { type: "select", name: "role", label: "fWhoIsSpeaking", options: roles },
  { type: "pair", name: "quote", label: "fQuote", textarea: true, required: true },
  { type: "datetime", name: "spoken_on", label: "fSpokenOn" },
  { type: "number", name: "rating", label: "fRating" },
  { type: "url", name: "facebook_url", label: "fFacebookProfile" },
  { type: "image", name: "image_url", fileName: "image", label: "fPhoto" },
  { type: "number", name: "order", label: "fOrder" },
];

export const whyFields = (icons: Option[]): CmsField[] => [
  { type: "pair", name: "title", label: "fTitle", required: true },
  { type: "pair", name: "description", label: "fDescription", textarea: true, required: true },
  { type: "image", name: "image_url", fileName: "image", label: "fPhoto" },
  { type: "select", name: "icon", label: "fIcon", options: icons },
  { type: "number", name: "order", label: "fOrder" },
];

export const aboutFields: CmsField[] = [
  { type: "pair", name: "introduction", label: "fIntroduction", textarea: true, required: true, section: "sectionStory" },
  { type: "pair", name: "history", label: "fHistory", textarea: true, required: true, section: "sectionStory" },
  { type: "pair", name: "vision", label: "fVision", textarea: true, required: true, section: "sectionPurpose" },
  { type: "pair", name: "mission", label: "fMission", textarea: true, required: true, section: "sectionPurpose" },
  { type: "pair", name: "quranic_approach", label: "fQuranicApproach", textarea: true, required: true, section: "sectionPurpose" },
  { type: "pair", name: "principal_message", label: "fPrincipalMessage", textarea: true, required: true, section: "sectionPrincipal" },
];

export const leaderFields: CmsField[] = [
  { type: "pair", name: "name", label: "fName", required: true, section: "sectionDetails" },
  { type: "pair", name: "role", label: "fRole", required: true, section: "sectionDetails" },
  { type: "pair", name: "bio", label: "fBio", textarea: true, section: "sectionDetails" },
  { type: "image", name: "photo_url", fileName: "photo", label: "fPhoto", section: "sectionMedia" },
  { type: "number", name: "order", label: "fOrder", section: "sectionPublishing" },
];

export const facilityFields: CmsField[] = [
  { type: "pair", name: "title", label: "fTitle", required: true, section: "sectionDetails" },
  { type: "pair", name: "description", label: "fDescription", textarea: true, required: true, section: "sectionDetails" },
  { type: "image", name: "image_url", fileName: "image", label: "fImage", section: "sectionMedia" },
  { type: "number", name: "order", label: "fOrder", section: "sectionPublishing" },
];

export const contactFields: CmsField[] = [
  { type: "pair", name: "school_name", label: "fSchoolName", required: true, section: "sectionIdentity" },
  { type: "pair", name: "tagline", label: "fTagline", section: "sectionIdentity" },
  { type: "image", name: "logo_url", fileName: "logo", label: "fLogo", section: "sectionIdentity" },
  { type: "pair", name: "address", label: "fAddress", required: true, section: "sectionContact" },
  { type: "text", name: "phone_primary", label: "fPhonePrimary", required: true, section: "sectionContact" },
  { type: "text", name: "phone_secondary", label: "fPhoneSecondary", section: "sectionContact" },
  { type: "text", name: "email", label: "fEmail", required: true, section: "sectionContact" },
  { type: "pair", name: "office_hours", label: "fOfficeHours", required: true, section: "sectionContact" },
  { type: "url", name: "map_embed_url", label: "fMapEmbedUrl", section: "sectionMap" },
  { type: "url", name: "facebook_url", label: "fFacebook", section: "sectionSocial" },
  { type: "url", name: "youtube_url", label: "fYoutube", section: "sectionSocial" },
  { type: "url", name: "instagram_url", label: "fInstagram", section: "sectionSocial" },
  { type: "url", name: "whatsapp_url", label: "fWhatsapp", section: "sectionSocial" },
];

export const admissionInfoFields: CmsField[] = [
  { type: "checkbox", name: "admission_open", label: "fAdmissionOpen" },
  { type: "pair", name: "admission_announcement", label: "fAdmissionAnnouncement", textarea: true },
];

export const eventFields: CmsField[] = [
  { type: "text", name: "slug", label: "fSlug", hint: "slugHint", section: "sectionDetails" },
  { type: "pair", name: "title", label: "fTitle", required: true, section: "sectionDetails" },
  { type: "pair", name: "location", label: "fLocation", required: true, section: "sectionDetails" },
  { type: "pair", name: "description", label: "fDescription", textarea: true, required: true, section: "sectionDetails" },
  { type: "datetime", name: "start_at", label: "fStartAt", required: true, section: "sectionSchedule" },
  { type: "datetime", name: "end_at", label: "fEndAt", section: "sectionSchedule" },
  { type: "image", name: "image_url", fileName: "image", label: "fImage", section: "sectionPublishing" },
  { type: "checkbox", name: "is_published", label: "fPublished", section: "sectionPublishing" },
];

export const newsFields = (categories: Option[]): CmsField[] => [
  { type: "text", name: "slug", label: "fSlug", hint: "slugHint", section: "sectionDetails" },
  { type: "pair", name: "title", label: "fTitle", required: true, section: "sectionDetails" },
  { type: "select", name: "category", label: "fCategory", options: categories, required: true, section: "sectionDetails" },
  { type: "pair", name: "description", label: "fDescription", textarea: true, required: true, section: "sectionDetails" },
  { type: "image", name: "featured_image_url", fileName: "featured_image", label: "fImage", section: "sectionMedia" },
  { type: "datetime", name: "published_at", label: "fPublishedAt", required: true, section: "sectionPublishing" },
  { type: "checkbox", name: "is_published", label: "fPublished", section: "sectionPublishing" },
  { type: "checkbox", name: "is_important", label: "fImportantNotice", section: "sectionPublishing" },
];

export const gradeFields: CmsField[] = [
  { type: "text", name: "slug", label: "fSlug", hint: "slugHint", section: "sectionDetails" },
  { type: "pair", name: "name", label: "fName", required: true, section: "sectionDetails" },
  { type: "pair", name: "description", label: "fDescription", textarea: true, required: true, section: "sectionDetails" },
  { type: "checkbox", name: "listed_on_curriculum", label: "fListedOnCurriculum", section: "sectionPublishing" },
  { type: "number", name: "order", label: "fOrder", section: "sectionPublishing" },
  { type: "checkbox", name: "open_for_admission", label: "fOpenForAdmission", section: "sectionAdmission" },
  { type: "decimal", name: "fee_amount", label: "fFeeAmount", hint: "feeAmountHint", section: "sectionAdmission" },
];

export const subjectFields = (categories: Option[]): CmsField[] => [
  { type: "pair", name: "name", label: "fName", required: true },
  { type: "select", name: "category", label: "fCategory", options: categories, required: true },
  { type: "pair", name: "description", label: "fDescription", textarea: true },
  { type: "number", name: "order", label: "fOrder" },
];

export const documentFields: CmsField[] = [
  { type: "pair", name: "title", label: "fTitle", required: true },
  { type: "image", name: "download_url", fileName: "file", label: "fFile", hint: "documentFileHint" },
  { type: "url", name: "file_url", label: "fFileUrl", hint: "documentUrlHint" },
  { type: "number", name: "order", label: "fOrder" },
];

export const albumFields = (categories: Option[]): CmsField[] => [
  { type: "text", name: "slug", label: "fSlug", hint: "slugHint", section: "sectionDetails" },
  { type: "pair", name: "title", label: "fTitle", required: true, section: "sectionDetails" },
  { type: "select", name: "category", label: "fCategory", options: categories, required: true, section: "sectionDetails" },
  { type: "pair", name: "description", label: "fDescription", textarea: true, section: "sectionDetails" },
  { type: "image", name: "cover_image_url", fileName: "cover_image", label: "fCoverImage", section: "sectionMedia" },
  { type: "number", name: "order", label: "fOrder", section: "sectionPublishing" },
];

// Per-class fees are set from the class's own editor (Curriculum page) now —
// this is only the default fee shown to applicants with no class-specific
// fee configured, so there's no grade selector here.
export const defaultFeeFields: CmsField[] = [
  { type: "decimal", name: "amount", label: "fAmount", required: true },
  { type: "text", name: "currency", label: "fCurrency" },
  { type: "pair", name: "label", label: "fLabel" },
  { type: "checkbox", name: "is_active", label: "fActive" },
];

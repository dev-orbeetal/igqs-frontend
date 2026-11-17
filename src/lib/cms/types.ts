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
  | { type: "pair"; name: string; label: string; textarea?: boolean; rich?: boolean }
  | { type: "checkbox"; name: string; label: string }
  | { type: "select"; name: string; label: string; options: Option[] }
  | { type: "datetime"; name: string; label: string }
  | { type: "image"; name: string; fileName: string; label: string }
  // A document (syllabus PDF and the like): same upload plumbing as "image",
  // without the thumbnail, and it accepts any file type.
  | { type: "file"; name: string; fileName: string; label: string; accept?: string }
);

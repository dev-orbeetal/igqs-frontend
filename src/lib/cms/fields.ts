import type { CmsField, Option } from "@/lib/cms/types";

// Labels are `cms` message keys, not literal text. The panel has a working
// EN/BN switcher, and leaving these as English strings meant a Bangla shell
// wrapped around an English form. `required` mirrors the serializers in
// content/staff_serializers.py — it is what the API will actually reject.

export const heroContentFields: CmsField[] = [
  { type: "pair", name: "hero_title", label: "fHeroTitle", required: true },
  { type: "pair", name: "hero_subtitle", label: "fHeroSubtitle", textarea: true, required: true },
  { type: "image", name: "hero_image_url", fileName: "hero_image", label: "fHeroImage", hint: "heroImageHint" },
];

export const homeSectionFields: CmsField[] = [
  { type: "pair", name: "title", label: "fTitle", required: true },
  { type: "pair", name: "description", label: "fDescription", textarea: true, required: true },
  { type: "number", name: "order", label: "fOrder" },
];

export const homeFields: CmsField[] = [
  { type: "pair", name: "chairman_name", label: "fChairmanName", section: "sectionChairman" },
  { type: "pair", name: "chairman_title", label: "fChairmanTitle", section: "sectionChairman" },
  { type: "pair", name: "chairman_message", label: "fChairmanMessage", textarea: true, section: "sectionChairman" },
  { type: "image", name: "chairman_photo_url", fileName: "chairman_photo", label: "fChairmanPhoto", section: "sectionChairman" },
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

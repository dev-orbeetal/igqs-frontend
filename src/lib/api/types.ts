export type ApplicationDetail = {
  application_id: string;
  receipt_id: string;
  student_name: string;
  student_name_bn: string;
  guardian_name: string;
  applying_class: string;
  mobile: string;
  email: string;
  status: string;
  status_label: string;
  rejection_reason?: string;
  created_at: string;
  receipt_pdf_url: string;
  receipt_view_url?: string;
  receipt_email_sent: boolean;
  transaction: {
    payment_method: string;
    transaction_id: string;
    payment_amount: string;
    payment_date: string;
    payer_mobile: string;
    payment_screenshot: string;
  };
};

export type SiteSettings = {
  school_name: string;
  tagline: string;
  logo: string;
  address: string;
  phone_primary: string;
  phone_secondary: string;
  email: string;
  map_embed_url: string;
  office_hours: string;
  facebook_url: string;
  youtube_url: string;
  instagram_url: string;
  whatsapp_url: string;
  admission_open: boolean;
  admission_announcement: string;
};

export type AdmissionFeeInfo = {
  grade_slug: string | null;
  grade_name: string | null;
  amount: string;
  currency: string;
  label: string;
  display: string;
};

export type PaymentMethodDetail = { label: string; value: string };

export type PaymentMethodInfo = {
  code: string;
  name: string;
  details?: PaymentMethodDetail[];
  account_number?: string;
  account_name?: string;
  bank_name?: string;
  payment_type?: string;
  instructions?: string;
};

export function paymentMethodRows(
  method: PaymentMethodInfo,
  labels: { accountName: string; accountNumber: string; bank: string; type: string }
): PaymentMethodDetail[] {
  if (Array.isArray(method.details) && method.details.length > 0) {
    return method.details.filter((row) => row && (row.label || row.value));
  }
  const rows: PaymentMethodDetail[] = [];
  const push = (label: string, value?: string) => {
    const text = (value ?? "").trim();
    if (text) rows.push({ label, value: text });
  };
  push(labels.accountName, method.account_name);
  push(labels.accountNumber, method.account_number);
  push(labels.bank, method.bank_name);
  push(labels.type, method.payment_type);
  push("", method.instructions);
  return rows;
}

export type AdmissionInfo = {
  default_fee: AdmissionFeeInfo | null;
  fees: AdmissionFeeInfo[];
  methods: PaymentMethodInfo[];
};

export type ClassOption = { slug: string; name: string };

export type EventItem = {
  slug: string;
  title: string;
  start_at: string;
  end_at: string | null;
  location: string;
  image: string;
  description?: string;
};

export type NewsItem = {
  slug: string;
  title: string;
  category: string;
  published_at: string;
  image: string;
  is_important: boolean;
  description?: string;
};

export type GalleryAlbum = {
  slug: string;
  title: string;
  category: string;
  description: string;
  cover_image_url: string;
  images: { id: number; image: string; caption: string }[];
};

export type Grade = {
  id: number;
  slug: string;
  name: string;
  description: string;
  subjects: { id: number; name: string; category: string; description: string }[];
  documents: { id: number; title: string; download_url: string }[];
};

export type HomePayload = {
  home: {
    hero_title: string;
    hero_subtitle: string;
    hero_image_url: string;
    welcome: string;
    about_preview: string;
    principal_name: string;
    principal_title: string;
    principal_message: string;
    principal_photo_url: string;
    chairman_name?: string;
    chairman_title?: string;
    chairman_message?: string;
    chairman_photo_url?: string;
    goals?: string;
    beacon?: string;
    dreams?: string;
    child_gain?: string;
    holistic?: string;
    admission_procedures?: string;
    tuition?: string;
    uniform?: string;
  };
  hero_images: string[];
  sections?: { id: number; title: string; description: string }[];
  highlights: { id: number; value: string; label: string; icon: string }[];
  why_choose: { id: number; title: string; description: string; icon: string; image: string }[];
  testimonials: {
    id: number;
    name: string;
    role: string;
    quote: string;
    spoken_on: string | null;
    rating: number;
    facebook_url: string;
    image: string;
  }[];
  upcoming_events: EventItem[];
  latest_news: NewsItem[];
  notices: NewsItem[];
  gallery: GalleryAlbum[];
  curriculum_highlights: Grade[];
};

export type AboutPayload = {
  about: {
    introduction: string;
    vision: string;
    mission: string;
    history: string;
    quranic_approach: string;
    principal_message: string;
  };
  leadership: {
    id: number;
    name: string;
    role: string;
    bio: string;
    photo_url: string;
  }[];
  facilities: {
    id: number;
    title: string;
    description: string;
    image_url: string;
  }[];
};

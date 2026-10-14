const API =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.VERCEL ? "https://admin.igqsbd.com" : "http://127.0.0.1:8855");

export function apiUrl(path: string, locale?: string) {
  const url = new URL(path, API);
  if (locale) url.searchParams.set("lang", locale);
  return url.toString();
}

export async function apiGet<T>(path: string, locale: string): Promise<T | null> {
  try {
    const res = await fetch(apiUrl(path, locale), {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function apiPost(path: string, body: FormData | object, token?: string) {
  const isForm = body instanceof FormData;
  const headers = new Headers();
  if (!isForm) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(apiUrl(path), {
    method: "POST",
    body: isForm ? body : JSON.stringify(body),
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }
  return data;
}

export async function apiGetAuth<T>(path: string, token: string, locale?: string): Promise<T> {
  const res = await fetch(apiUrl(path, locale), {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }
  return data as T;
}

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

export function parseApiError(error: unknown): {
  form?: string;
  code?: string;
  fields: Record<string, string>;
} {
  const fields: Record<string, string> = {};
  const raw = error instanceof Error ? error.message : "";
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    let form: string | undefined;
    let code: string | undefined;
    for (const [key, value] of Object.entries(data)) {
      const text = Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
      if (!text) continue;
      if (key === "code") code = text;
      else if (key === "detail") form = text;
      else fields[key] = text;
    }
    return { form, code, fields };
  } catch {
    return { form: raw || undefined, fields };
  }
}

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

export type PaymentMethodInfo = {
  code: string;
  name: string;
  details: { label: string; value: string }[];
};

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
  };
  why_choose: { id: number; title: string; description: string; icon: string }[];
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

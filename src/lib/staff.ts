import { apiUrl } from "@/lib/api";

const TOKEN_KEY = "igqs-staff-token";

export type StaffUser = {
  username: string;
  name: string;
};

export function formatMoney(amount: string | number, locale: string, currency = "BDT") {
  const value = Number(amount);
  const formatted = Number.isFinite(value)
    ? value.toLocaleString(locale === "bn" ? "bn-BD" : "en-GB")
    : String(amount);
  return `${currency} ${formatted}`;
}

export type StaffStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  today: number;
  by_class: { applying_class: string; total: number }[];
  fee_collected: string;
  fee_pending: string;
  fee_submitted: string;
  currency: string;
};

export type StaffApplicationListItem = {
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
  payment_method: string;
  payment_method_label: string;
  transaction_id: string;
  payment_amount: string;
  created_at: string;
  rejection_reason: string;
};

export type StaffApplicationDetail = StaffApplicationListItem & {
  date_of_birth: string;
  gender: string;
  gender_label: string;
  previous_class: string;
  student_address: string;
  student_photo: string;
  birth_certificate: string;
  father_name: string;
  mother_name: string;
  father_occupation: string;
  mother_occupation: string;
  guardian_address: string;
  emergency_contact: string;
  previous_academic_info: string;
  special_requirements: string;
  receipt_pdf_url: string;
  receipt_view_url: string;
  reviewed_at: string | null;
  reviewed_by: string;
  transaction: {
    payment_method: string;
    transaction_id: string;
    payment_amount: string;
    payment_date: string;
    payer_mobile: string;
    payment_screenshot: string;
  };
};

export function getStaffToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function setStaffToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStaffToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function parseError(res: Response) {
  const data = await res.json().catch(() => ({}));
  throw new Error(data.detail || JSON.stringify(data) || res.statusText);
}

const adminLoginDisabled = process.env.NEXT_PUBLIC_ADMIN_LOGIN_DISABLED === "true";

export async function staffRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = adminLoginDisabled ? "" : getStaffToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Token ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(apiUrl(path), { ...init, headers, cache: "no-store" });
  if (res.status === 401) {
    clearStaffToken();
    throw new Error("unauthorized");
  }
  if (!res.ok) await parseError(res);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function staffDownload(path: string, filename: string) {
  const token = getStaffToken();
  const res = await fetch(apiUrl(path), {
    headers: token ? { Authorization: `Token ${token}` } : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Download failed.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function staffLogin(username: string, password: string) {
  const data = await staffRequest<{ token: string } & StaffUser>("/api/admissions/staff/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setStaffToken(data.token);
  return data;
}

export async function staffLogout() {
  try {
    await staffRequest("/api/admissions/staff/logout/", { method: "POST" });
  } finally {
    clearStaffToken();
  }
}

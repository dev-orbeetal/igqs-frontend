import { apiUrl } from "@/lib/api/client";
import type { StaffUser } from "@/lib/staff/types";
import { compressFormImages } from "@/lib/compress-image";

const TOKEN_KEY = "igqs-staff-token";

export function formatMoney(amount: string | number, locale: string, currency = "BDT") {
  const value = Number(amount);
  const formatted = Number.isFinite(value)
    ? value.toLocaleString(locale === "bn" ? "bn-BD" : "en-GB")
    : String(amount);
  return `${currency} ${formatted}`;
}

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

/**
 * A failed staff request. DRF answers a rejected write with
 * `{"field_name": ["message", ...]}`, which used to be flattened into
 * `JSON.stringify(data)` and shown to staff as a raw JSON blob — or, in the
 * item editors, swallowed entirely. Keeping the parsed shape lets a form put
 * each message under the field it belongs to.
 */
export class StaffApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string>) {
    super(message);
    this.name = "StaffApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const NON_FIELD_KEYS = new Set(["detail", "non_field_errors"]);

function flatten(value: unknown): string {
  if (Array.isArray(value)) return value.map(flatten).filter(Boolean).join(" ");
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).map(flatten).filter(Boolean).join(" ");
  }
  return value === null || value === undefined ? "" : String(value);
}

async function parseError(res: Response) {
  const data: unknown = await res.json().catch(() => ({}));
  const fieldErrors: Record<string, string> = {};
  const summary: string[] = [];

  if (data && typeof data === "object" && !Array.isArray(data)) {
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const message = flatten(value);
      if (!message) continue;
      if (NON_FIELD_KEYS.has(key)) summary.push(message);
      else fieldErrors[key] = message;
    }
  } else {
    const message = flatten(data);
    if (message) summary.push(message);
  }

  // With field errors in hand the caller shows those; a bare "Bad Request"
  // on top of them tells staff nothing, so the message stays empty and the
  // caller falls back to its own translated summary.
  const message =
    summary.join(" ") || (Object.keys(fieldErrors).length > 0 ? "" : res.statusText);
  throw new StaffApiError(message, res.status, fieldErrors);
}

// Local-dev convenience only. Gated on NODE_ENV so a stray env var set on a
// shared/staging/preview deployment can never disable staff auth there.
export const adminLoginDisabled =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_ADMIN_LOGIN_DISABLED === "true";

const inflightGets = new Map<string, Promise<unknown>>();

export async function staffRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  if (method === "GET" && !init.body) {
    const pending = inflightGets.get(path);
    if (pending) return pending as Promise<T>;
    const request = staffRequestOnce<T>(path, init).finally(() => {
      if (inflightGets.get(path) === request) inflightGets.delete(path);
    });
    inflightGets.set(path, request);
    return request;
  }
  return staffRequestOnce<T>(path, init);
}

async function staffRequestOnce<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = adminLoginDisabled ? "" : getStaffToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Token ${token}`);
  let body = init.body;
  if (body instanceof FormData) body = await compressFormImages(body);
  if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(apiUrl(path), { ...init, body, headers, cache: "no-store" });
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

/**
 * Opens a staff-only file (e.g. a receipt PDF) in a new tab. The request
 * needs the staff token header, so the file is fetched here and handed to
 * the tab as a blob URL. The tab is opened before the await so popup
 * blockers treat it as part of the click; if a blocker stops it anyway, the
 * file is downloaded instead of replacing the current page.
 */
export async function staffOpen(path: string, fallbackFilename: string) {
  const tab = window.open("", "_blank");
  try {
    const token = getStaffToken();
    const res = await fetch(apiUrl(path), {
      headers: token ? { Authorization: `Token ${token}` } : undefined,
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Open failed.");
    const url = URL.createObjectURL(await res.blob());
    if (tab) {
      tab.location.href = url;
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.download = fallbackFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    // Long enough for the tab to load it; the tab keeps its own copy.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    tab?.close();
    throw error;
  }
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

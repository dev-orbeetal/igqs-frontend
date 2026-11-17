import { compressFormImages } from "@/lib/compress-image";

const SITE_HOSTS = new Set(["igqsbd.com", "www.igqsbd.com", "admin.igqsbd.com"]);
const REQUEST_TIMEOUT_MS = 15000;

function configuredApi() {
  return (
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.VERCEL ? "https://igqsbd.com" : "http://127.0.0.1:8855")
  );
}

function apiBase() {
  const configured = configuredApi();
  if (typeof window === "undefined") return configured;
  try {
    if (SITE_HOSTS.has(new URL(configured).hostname)) return window.location.origin;
  } catch {
    return configured;
  }
  return configured;
}

export function apiUrl(path: string, locale?: string) {
  const url = new URL(path, apiBase());
  if (locale) url.searchParams.set("lang", locale);
  return url.toString();
}

function isProductionSite(base: string) {
  try {
    return SITE_HOSTS.has(new URL(base).hostname);
  } catch {
    return false;
  }
}

export async function apiGet<T>(path: string, locale: string): Promise<T | null> {
  try {
    if (typeof window === "undefined" && isProductionSite(configuredApi())) {
      const { cachedPublicGet } = await import("@/lib/public-api-cache");
      const url = new URL(path, "https://igqsbd.com");
      if (locale) url.searchParams.set("lang", locale);
      const body = await cachedPublicGet(`${url.pathname}${url.search}`);
      if (!body) return null;
      return JSON.parse(body) as T;
    }

    const res = await fetch(apiUrl(path, locale), {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      ...(typeof window === "undefined"
        ? { next: { revalidate: 60 } }
        : { cache: "no-store" as const }),
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
  const payload = isForm ? await compressFormImages(body) : JSON.stringify(body);
  const res = await fetch(apiUrl(path), {
    method: "POST",
    body: payload,
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }
  return data;
}

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

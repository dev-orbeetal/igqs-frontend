const KEY = "igqs-guardian-session";

export type GuardianSession = {
  token: string;
  phone: string;
};

export function getGuardianSession(): GuardianSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as GuardianSession;
    if (!data.token || !data.phone) return null;
    return data;
  } catch {
    return null;
  }
}

export function setGuardianSession(session: GuardianSession) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearGuardianSession() {
  localStorage.removeItem(KEY);
}

export function normalizeBdPhone(value: string) {
  let raw = value.trim().replace(/[\s-]/g, "");
  if (raw.startsWith("+880")) raw = `0${raw.slice(4)}`;
  else if (raw.startsWith("880")) raw = `0${raw.slice(3)}`;
  return raw;
}

export function isBdPhone(value: string) {
  return /^01[3-9]\d{8}$/.test(normalizeBdPhone(value));
}

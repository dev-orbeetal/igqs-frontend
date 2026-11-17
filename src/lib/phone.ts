export function normalizeBdPhone(value: string) {
  let raw = value.trim().replace(/[\s-]/g, "");
  if (raw.startsWith("+880")) raw = `0${raw.slice(4)}`;
  else if (raw.startsWith("880")) raw = `0${raw.slice(3)}`;
  return raw;
}

export function isBdPhone(value: string) {
  return /^01[3-9]\d{8}$/.test(normalizeBdPhone(value));
}

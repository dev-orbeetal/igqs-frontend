"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { btn } from "@/components/staff/buttons";
import { useRouter } from "@/i18n/navigation";
import { staffLogin } from "@/lib/staff";

export function StaffLoginForm() {
  const t = useTranslations("staff");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      await staffLogin(username, password);
      router.replace("/dashboard");
    } catch {
      setError(t("loginError"));
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div>
        <h1 className="font-display text-3xl">{t("loginTitle")}</h1>
        <p className="mt-1 text-sm text-igqs-muted">{t("loginSubtitle")}</p>
      </div>
      <label className="mt-6 block text-sm">
        {t("username")}
        <input
          className="mt-1 w-full rounded-xl border border-igqs-gold/30 bg-transparent px-3 py-2"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label className="mt-4 block text-sm">
        {t("password")}
        <input
          type="password"
          className="mt-1 w-full rounded-xl border border-igqs-gold/30 bg-transparent px-3 py-2"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className={`mt-6 w-full ${btn.primary}`}
      >
        {sending ? t("signingIn") : t("signIn")}
      </button>
    </form>
  );
}

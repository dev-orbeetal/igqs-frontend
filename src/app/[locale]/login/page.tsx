import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Logo } from "@/components/brand/Logo";
import { StaffLoginForm } from "@/components/staff/StaffLoginForm";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { adminLoginDisabled } from "@/lib/staff";

export default async function StaffLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (adminLoginDisabled) {
    redirect({
      href: "/dashboard",
      locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
    });
  }
  setRequestLocale(locale);
  const t = await getTranslations("staff");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f3d30] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-igqs-ink shadow-xl">
        <div className="mb-6 flex justify-center">
          <Logo iconOnly />
        </div>
        <p className="mb-6 text-center text-xs tracking-wide text-igqs-muted">{t("kicker")}</p>
        <StaffLoginForm />
      </div>
    </div>
  );
}

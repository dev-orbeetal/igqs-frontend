import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/locale/LanguageSwitcher";
import { StaffLoginForm } from "@/components/staff/StaffLoginForm";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default async function StaffLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (process.env.NEXT_PUBLIC_ADMIN_LOGIN_DISABLED === "true") {
    redirect({
      href: "/staff",
      locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
    });
  }
  setRequestLocale(locale);
  await getTranslations("staff");

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-16">
      <div className="mx-auto mb-8 flex max-w-md items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
      <StaffLoginForm />
    </div>
  );
}

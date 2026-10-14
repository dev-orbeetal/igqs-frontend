import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/Logo";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/icons/Social";
import { Link } from "@/i18n/navigation";
import type { SiteSettings } from "@/lib/api";

export async function Footer({ site }: { site?: SiteSettings | null }) {
  const t = await getTranslations("nav");
  const tf = await getTranslations("footer");
  const tc = await getTranslations("contact");

  return (
    <footer className="pattern-geo-dark border-t border-igqs-gold/25 bg-igqs-green text-igqs-cream print:hidden dark:bg-[#04110c]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <Logo light src={site?.logo} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-igqs-gold-soft/90">
            {site?.tagline}
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl text-igqs-gold">{tf("quick")}</h3>
          <div className="heading-rule mt-3" />
          <div className="mt-4 grid gap-2 text-sm">
            <Link href="/about" className="transition-colors duration-500 hover:text-igqs-gold">
              {t("about")}
            </Link>
            <Link href="/curriculum" className="transition-colors duration-500 hover:text-igqs-gold">
              {t("curriculum")}
            </Link>
            <Link href="/admission" className="transition-colors duration-500 hover:text-igqs-gold">
              {t("admission")}
            </Link>
            <Link href="/admission/payments" className="transition-colors duration-500 hover:text-igqs-gold">
              {t("myPayments")}
            </Link>
            <Link href="/admission/receipt" className="transition-colors duration-500 hover:text-igqs-gold">
              {t("receipt")}
            </Link>
            <Link href="/news" className="transition-colors duration-500 hover:text-igqs-gold">
              {t("news")}
            </Link>
            <Link href="/contact" className="transition-colors duration-500 hover:text-igqs-gold">
              {t("contact")}
            </Link>
          </div>
        </div>
        <div>
          <h3 className="font-display text-xl text-igqs-gold">{tf("contact")}</h3>
          <div className="heading-rule mt-3" />
          <p className="mt-4 text-sm leading-relaxed text-igqs-cream/85">
            {site?.address}
            <br />
            {site?.phone_primary}
            <br />
            {site?.email}
          </p>
          <div className="mt-4 flex gap-3">
            {site?.facebook_url && (
              <a
                href={site.facebook_url}
                aria-label={tc("facebook")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-igqs-gold/35 text-igqs-gold-soft transition-colors duration-500 hover:border-igqs-gold hover:bg-igqs-gold/10"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
            )}
            {site?.youtube_url && (
              <a
                href={site.youtube_url}
                aria-label={tc("youtube")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-igqs-gold/35 text-igqs-gold-soft transition-colors duration-500 hover:border-igqs-gold hover:bg-igqs-gold/10"
              >
                <YoutubeIcon className="h-5 w-5" />
              </a>
            )}
            {site?.instagram_url && (
              <a
                href={site.instagram_url}
                aria-label={tc("instagram")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-igqs-gold/35 text-igqs-gold-soft transition-colors duration-500 hover:border-igqs-gold hover:bg-igqs-gold/10"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="gold-rule" />
      <p className="py-5 text-center text-xs text-igqs-gold-soft/80">
        © {new Date().getFullYear()} {site?.school_name}. {tf("rights")}
        {" · "}
        {tf("webfont")}-{" "}
        <a
          href="https://lipighor.com"
          className="underline decoration-igqs-gold/50 underline-offset-2 hover:text-igqs-gold"
        >
          lipighor.com
        </a>
      </p>
    </footer>
  );
}

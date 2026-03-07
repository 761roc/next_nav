import { AppHeader } from "@/components/app-header";
import { NavCardGrid } from "@/components/nav-card-grid";
import { navLinks } from "@/data/nav-links";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getLocaleUrl } from "@/lib/seo";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "seo" });

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: t("title"),
    description: t("description"),
    url: getLocaleUrl(locale),
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: `${getLocaleUrl(locale)}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main className="page-wrap">
      <div className="hero-bg" aria-hidden="true" />
      <section className="content-shell">
        <AppHeader />
        <section className="glass-card mt-6 p-5 sm:p-6" aria-label={t("contentTitle")}>
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{t("contentTitle")}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-subtle)] sm:text-base">
            {t("contentIntro")}
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-7 text-[var(--text-subtle)] sm:text-base">
            <li>{t("bullet1")}</li>
            <li>{t("bullet2")}</li>
            <li>{t("bullet3")}</li>
          </ul>
        </section>
        <NavCardGrid items={navLinks} />
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </main>
  );
}

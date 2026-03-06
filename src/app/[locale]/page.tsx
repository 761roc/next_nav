import { AppHeader } from "@/components/app-header";
import { NavCardGrid } from "@/components/nav-card-grid";
import { navLinks } from "@/data/nav-links";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAbsoluteUrl, siteConfig } from "@/lib/seo";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("nav");
  const itemListElements = navLinks.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: t(item.titleKey),
    url:
      item.kind === "external"
        ? item.href
        : getAbsoluteUrl(`/${locale}${item.href}`),
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: siteConfig.name,
        url: getAbsoluteUrl(`/${locale}`),
        inLanguage: locale,
        description: t("sectionTitle"),
      },
      {
        "@type": "ItemList",
        name: t("sectionTitle"),
        itemListElement: itemListElements,
      },
    ],
  };

  return (
    <main className="page-wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="hero-bg" aria-hidden="true" />
      <section className="content-shell">
        <AppHeader />
        <NavCardGrid items={navLinks} />
      </section>
    </main>
  );
}

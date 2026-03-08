import { AppHeader } from "@/components/app-header";
import { NavCardGrid } from "@/components/nav-card-grid";
import { navLinks } from "@/data/nav-links";
import { setRequestLocale } from "next-intl/server";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const externalCount = navLinks.filter((item) => item.kind === "external").length;
  const uniqueTagCount = new Set(
    navLinks.flatMap((item) => item.tags ?? []),
  ).size;

  return (
    <main className="page-wrap">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="hero-bg" aria-hidden="true" />
      <section id="main-content" className="content-shell">
        <AppHeader
          totalLinks={navLinks.length}
          externalLinks={externalCount}
          tagCount={uniqueTagCount}
        />
        <NavCardGrid items={navLinks} />
      </section>
    </main>
  );
}

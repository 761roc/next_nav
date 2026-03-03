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

  return (
    <main className="page-wrap">
      <div className="hero-bg" aria-hidden="true" />
      <section className="content-shell">
        <AppHeader />
        <NavCardGrid items={navLinks} />
      </section>
    </main>
  );
}

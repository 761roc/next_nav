import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAbsoluteUrl } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return {
    title: t("title"),
    description: t("body"),
    alternates: {
      canonical: getAbsoluteUrl(`/${locale}/about`),
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("about");

  return (
    <main className="page-wrap">
      <div className="hero-bg" aria-hidden="true" />
      <section className="content-shell">
        <article className="glass-card p-8 sm:p-10">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-subtle)]">
            {t("body")}
          </p>
          <Link
            href={`/${locale}`}
            className="mt-6 inline-flex rounded-xl border border-white/40 bg-white/45 px-4 py-2 text-sm font-medium transition hover:bg-white/60 dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/20"
          >
            {t("backHome")}
          </Link>
        </article>
      </section>
    </main>
  );
}

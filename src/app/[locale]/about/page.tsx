import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AppHeader } from "@/components/app-header";
import { navLinks } from "@/data/nav-links";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tAbout = await getTranslations("about");
  const tCommon = await getTranslations("common");
  const tTheme = await getTranslations("theme");
  const tLocale = await getTranslations("locale");
  const tNav = await getTranslations("nav");
  const externalCount = navLinks.filter((item) => item.kind === "external").length;
  const internalCount = navLinks.length - externalCount;
  const tagEntries = navLinks.flatMap((item) => item.tags ?? []);
  const uniqueTagCount = new Set(tagEntries).size;
  const topTag =
    Object.entries(
      tagEntries.reduce<Record<string, number>>((acc, tag) => {
        acc[tag] = (acc[tag] ?? 0) + 1;
        return acc;
      }, {}),
    ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
  const externalRatio = navLinks.length
    ? Math.round((externalCount / navLinks.length) * 100)
    : 0;
  const internalRatio = navLinks.length ? 100 - externalRatio : 0;

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
        <div className="about-grid">
          <article className="glass-card about-main">
            <p className="about-kicker">{tCommon("siteTitle")}</p>
            <h1 className="about-title">{tAbout("title")}</h1>
            <p className="about-body">{tAbout("body")}</p>
            <Link href={`/${locale}`} className="about-link">
              {tAbout("backHome")}
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M7 12h10M13 8l4 4-4 4" />
              </svg>
            </Link>
          </article>
          <aside className="about-side">
            <section className="glass-card about-mini">
              <h2 className="about-mini-title">{tCommon("siteTitle")}</h2>
              <p className="about-mini-body">{tCommon("siteSubtitle")}</p>
            </section>
            <section className="glass-card about-mini">
              <dl className="about-stats">
                <div>
                  <dt>{tNav("sectionTitle")}</dt>
                  <dd>{navLinks.length}</dd>
                </div>
                <div>
                  <dt>{tNav("badgeExternal")}</dt>
                  <dd>{externalCount}</dd>
                </div>
                <div>
                  <dt>{tNav("badgeInternal")}</dt>
                  <dd>{internalCount}</dd>
                </div>
                <div>
                  <dt>{tNav("metricTags")}</dt>
                  <dd>{uniqueTagCount}</dd>
                </div>
                <div>
                  <dt>{tLocale("label")}</dt>
                  <dd>5</dd>
                </div>
                <div>
                  <dt>{tTheme("label")}</dt>
                  <dd>3</dd>
                </div>
                <div>
                  <dt>{tNav("metricTopTag")}</dt>
                  <dd>{topTag}</dd>
                </div>
              </dl>
            </section>
            <section className="glass-card about-mini">
              <h2 className="about-mini-title">{tNav("distributionTitle")}</h2>
              <div className="about-progress">
                <div className="about-progress-row">
                  <span>{tNav("badgeExternal")}</span>
                  <strong>{externalRatio}%</strong>
                </div>
                <div className="about-progress-track">
                  <span style={{ width: `${externalRatio}%` }} />
                </div>
                <div className="about-progress-row">
                  <span>{tNav("badgeInternal")}</span>
                  <strong>{internalRatio}%</strong>
                </div>
                <div className="about-progress-track">
                  <span style={{ width: `${internalRatio}%` }} />
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

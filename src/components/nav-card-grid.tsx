import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { NavLinkItem } from "@/types";

type NavCardGridProps = {
  items: NavLinkItem[];
};

export function NavCardGrid({ items }: NavCardGridProps) {
  const t = useTranslations("nav");

  const sortedItems = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const totalItems = sortedItems.length;
  const externalCount = sortedItems.filter((item) => item.kind === "external").length;
  const internalCount = totalItems - externalCount;
  const uniqueTags = new Set(sortedItems.flatMap((item) => item.tags ?? []));
  const topTags = Object.entries(
    sortedItems
      .flatMap((item) => item.tags ?? [])
      .reduce<Record<string, number>>((acc, tag) => {
        acc[tag] = (acc[tag] ?? 0) + 1;
        return acc;
      }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const maxTagValue = topTags[0]?.[1] ?? 1;
  const externalRatio = totalItems ? Math.round((externalCount / totalItems) * 100) : 0;
  const internalRatio = totalItems ? 100 - externalRatio : 0;

  return (
    <section className="nav-section" aria-labelledby="nav-section-title">
      <div className="section-head">
        <h2 id="nav-section-title" className="section-title">
          {t("sectionTitle")}
        </h2>
        <span className="section-count" aria-label={`${totalItems}`}>
          {totalItems}
        </span>
      </div>
      <div className="insights-grid">
        <article className="glass-card insight-card insight-main">
          <p className="insight-kicker">{t("insightsTitle")}</p>
          <p className="insight-subtitle">{t("insightsSubtitle")}</p>
          <dl className="insight-metrics">
            <div>
              <dt>{t("metricTotal")}</dt>
              <dd>{totalItems}</dd>
            </div>
            <div>
              <dt>{t("metricExternal")}</dt>
              <dd>{externalCount}</dd>
            </div>
            <div>
              <dt>{t("metricInternal")}</dt>
              <dd>{internalCount}</dd>
            </div>
            <div>
              <dt>{t("metricTags")}</dt>
              <dd>{uniqueTags.size}</dd>
            </div>
          </dl>
        </article>
        <aside className="insight-side">
          <article className="glass-card insight-card insight-compact">
            <h3 className="insight-subsection">{t("distributionTitle")}</h3>
            <div className="dist-stack">
              <div className="dist-row">
                <span>{t("badgeExternal")}</span>
                <strong>{externalRatio}%</strong>
              </div>
              <div className="dist-track">
                <span style={{ width: `${externalRatio}%` }} />
              </div>
              <div className="dist-row">
                <span>{t("badgeInternal")}</span>
                <strong>{internalRatio}%</strong>
              </div>
              <div className="dist-track">
                <span style={{ width: `${internalRatio}%` }} />
              </div>
            </div>
          </article>
          <article className="glass-card insight-card insight-compact">
            <h3 className="insight-subsection">{t("tagTitle")}</h3>
            <ul className="tag-bars">
              {topTags.map(([tag, value]) => (
                <li key={tag}>
                  <div className="dist-row">
                    <span>{formatTag(tag)}</span>
                    <strong>{value}</strong>
                  </div>
                  <div className="dist-track">
                    <span
                      style={{ width: `${Math.max(12, Math.round((value / maxTagValue) * 100))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </aside>
      </div>
      <div className="nav-grid">
        {sortedItems.map((item, index) => {
          const commonClassName = `glass-card card-link ${getCardLayoutClass(index)}`;

          const badge =
            item.kind === "external" ? t("badgeExternal") : t("badgeInternal");

          return item.kind === "external" ? (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={commonClassName}
            >
              <CardBody
                title={t(item.titleKey)}
                description={item.descriptionKey ? t(item.descriptionKey) : ""}
                badge={badge}
                logoUrl={getLogoUrl(item)}
                iconText={item.icon ?? t(item.titleKey).charAt(0)}
                meta={getMeta(item)}
              />
            </a>
          ) : (
            <Link key={item.id} href={item.href} className={commonClassName}>
              <CardBody
                title={t(item.titleKey)}
                description={item.descriptionKey ? t(item.descriptionKey) : ""}
                badge={badge}
                logoUrl={undefined}
                iconText={item.icon ?? t(item.titleKey).charAt(0)}
                meta={getMeta(item)}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function CardBody({
  title,
  description,
  badge,
  logoUrl,
  iconText,
  meta,
}: {
  title: string;
  description: string;
  badge: string;
  logoUrl?: string;
  iconText: string;
  meta?: string;
}) {
  return (
    <div className="card-body">
      <div className="card-top">
        <div className="card-title-wrap">
          <div className="card-icon-wrap">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${title} logo`}
                width={24}
                height={24}
                unoptimized
                className="h-6 w-6 object-contain"
              />
            ) : (
              <span>{iconText}</span>
            )}
          </div>
          <div className="card-heading">
            <h3 className="card-title">{title}</h3>
            {meta ? <p className="card-meta">{meta}</p> : null}
          </div>
        </div>
        <span className="card-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </span>
      </div>
      <p className="card-description">{description}</p>
      <div className="card-footer">
        <span className="badge">{badge}</span>
      </div>
    </div>
  );
}

function getLogoUrl(item: NavLinkItem) {
  if (item.kind !== "external") return undefined;

  try {
    const hostname = new URL(item.href).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
  } catch {
    return undefined;
  }
}

function getMeta(item: NavLinkItem) {
  if (item.kind === "internal") return item.href;

  try {
    const hostname = new URL(item.href).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function getCardLayoutClass(index: number) {
  if (index === 0) return "sm:col-span-2";
  if (index === 3) return "lg:col-span-2";
  return "";
}

function formatTag(tag: string) {
  if (!tag) return tag;
  return `${tag.charAt(0).toUpperCase()}${tag.slice(1)}`;
}

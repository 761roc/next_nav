import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { NavLinkItem } from "@/types";

type NavCardGridProps = {
  items: NavLinkItem[];
};

export function NavCardGrid({ items }: NavCardGridProps) {
  const t = useTranslations("nav");

  const sortedItems = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <section className="mt-6 sm:mt-8">
      <h2 className="mb-4 text-lg font-semibold tracking-tight sm:mb-6">
        {t("sectionTitle")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedItems.map((item) => {
          const commonClassName =
            "glass-card card-link p-4 sm:p-5 transition duration-200 hover:-translate-y-0.5";

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
}: {
  title: string;
  description: string;
  badge: string;
  logoUrl?: string;
  iconText: string;
}) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/60 text-xs font-semibold text-[var(--text-main)] ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${title} logo`}
                width={24}
                height={24}
                loading="lazy"
                className="h-6 w-6 object-contain"
              />
            ) : (
              <span>{iconText}</span>
            )}
          </div>
          <h3 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h3>
        </div>
        <span className="badge">{badge}</span>
      </div>
      <p className="text-sm leading-6 text-[var(--text-subtle)]">{description}</p>
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

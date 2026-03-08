import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

type AppHeaderProps = {
  totalLinks: number;
  externalLinks: number;
  tagCount: number;
  localeCount?: number;
  themeModeCount?: number;
};

export function AppHeader({
  totalLinks,
  externalLinks,
  tagCount,
  localeCount = 5,
  themeModeCount = 3,
}: AppHeaderProps) {
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const tTheme = useTranslations("theme");
  const tLocale = useTranslations("locale");

  return (
    <header className="glass-card hero-panel">
      <div className="hero-main">
        <div>
          <h1 className="hero-title">{tCommon("siteTitle")}</h1>
          <p className="hero-subtitle">{tCommon("siteSubtitle")}</p>
        </div>
        <div className="hero-side">
          <div className="header-controls" role="toolbar" aria-label={tCommon("siteTitle")}>
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
          <dl className="header-stat-grid" aria-label={tNav("sectionTitle")}>
            <div className="header-stat">
              <dt>{tNav("sectionTitle")}</dt>
              <dd>{totalLinks}</dd>
            </div>
            <div className="header-stat">
              <dt>{tNav("badgeExternal")}</dt>
              <dd>{externalLinks}</dd>
            </div>
            <div className="header-stat">
              <dt>{tNav("badgeInternal")}</dt>
              <dd>{totalLinks - externalLinks}</dd>
            </div>
            <div className="header-stat">
              <dt>{tLocale("label")}</dt>
              <dd>{localeCount}</dd>
            </div>
            <div className="header-stat">
              <dt>{tTheme("label")}</dt>
              <dd>{themeModeCount}</dd>
            </div>
            <div className="header-stat">
              <dt>{tNav("metricTags")}</dt>
              <dd>{tagCount}</dd>
            </div>
          </dl>
        </div>
      </div>
    </header>
  );
}

import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  const t = useTranslations("common");

  return (
    <header className="glass-card p-5 sm:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="pt-0.5 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("siteTitle")}
          </h1>
          <div className="header-controls">
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-[var(--text-subtle)] sm:text-base">
          {t("siteSubtitle")}
        </p>
      </div>
    </header>
  );
}

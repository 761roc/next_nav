"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/types";

const locales: Locale[] = ["zh", "zh-Hant", "en", "fr", "ja"];
const localeLabels: Record<Locale, string> = {
  zh: "中文简体",
  "zh-Hant": "中文繁體",
  en: "English",
  fr: "Français",
  ja: "日本語",
};

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("locale");

  return (
    <label className="select-wrap">
      <span className="sr-only">{t("label")}</span>
      <select
        className="locale-select"
        value={locale}
        onChange={(event) => {
          router.replace(pathname, { locale: event.target.value as Locale });
        }}
        aria-label={t("label")}
      >
        {locales.map((item) => (
          <option key={item} value={item}>
            {localeLabels[item]}
          </option>
        ))}
      </select>
      <span className="select-caret" aria-hidden="true">
        ▾
      </span>
    </label>
  );
}

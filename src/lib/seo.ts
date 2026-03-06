import { routing } from "@/i18n/routing";

const FALLBACK_SITE_URL = "https://example.com";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configured) return FALLBACK_SITE_URL;

  try {
    return new URL(configured).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function getLocaleUrl(locale: string, path = "") {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}/${locale}${safePath}`;
}

export function getLanguageAlternates(path = "") {
  return routing.locales.reduce<Record<string, string>>((acc, locale) => {
    acc[locale] = getLocaleUrl(locale, path);
    return acc;
  }, {});
}

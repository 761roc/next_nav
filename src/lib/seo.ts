import { routing } from "@/i18n/routing";

const FALLBACK_SITE_URL = "https://nav.iupeng.top";

function normalizeSiteUrl(value: string) {
  const maybeUrl = value.startsWith("http") ? value : `https://${value}`;
  return new URL(maybeUrl).origin;
}

export function getSiteUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.CF_PAGES_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      return normalizeSiteUrl(candidate);
    } catch {
      continue;
    }
  }

  return FALLBACK_SITE_URL;
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

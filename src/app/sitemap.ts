import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getLocaleUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages = ["", "/about"];

  return routing.locales.flatMap((locale) =>
    pages.map((path) => ({
      url: getLocaleUrl(locale, path),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
  );
}

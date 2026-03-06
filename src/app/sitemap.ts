import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAbsoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routing.locales.flatMap((locale) => [
    {
      url: getAbsoluteUrl(`/${locale}`),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: getAbsoluteUrl(`/${locale}/about`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]);
}

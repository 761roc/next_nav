import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const FALLBACK_SITE_URL = "https://toolnext.site";

export const siteConfig = {
  name: "ToolNext",
  shortName: "ToolNext",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL,
  defaultLocale: routing.defaultLocale,
};

const localeSeo: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
  }
> = {
  zh: {
    title: "ToolNext 导航 - 常用网站与在线工具聚合",
    description:
      "ToolNext 提供高质量的常用网站导航与在线工具集合，支持多语言与极速访问，帮助你高效发现实用站点和生产力工具。",
    keywords: [
      "网站导航",
      "常用网站",
      "工具导航",
      "在线工具箱",
      "网址收藏",
      "ToolNext",
    ],
  },
  "zh-Hant": {
    title: "ToolNext 導航 - 常用網站與線上工具集合",
    description:
      "ToolNext 提供高品質的常用網站導航與線上工具集合，支援多語系與快速存取，協助你高效率找到實用網站與工具。",
    keywords: ["網站導航", "常用網站", "工具導航", "線上工具", "網址收藏", "ToolNext"],
  },
  en: {
    title: "ToolNext Hub - Curated Websites and Online Tools",
    description:
      "ToolNext is a multilingual hub for curated popular websites and useful online tools, designed for faster discovery and daily productivity.",
    keywords: [
      "website directory",
      "online tools",
      "navigation hub",
      "productivity tools",
      "curated links",
      "ToolNext",
    ],
  },
  fr: {
    title: "ToolNext Hub - Sites populaires et outils en ligne",
    description:
      "ToolNext est un hub multilingue qui regroupe des sites populaires et des outils en ligne utiles pour améliorer votre productivité.",
    keywords: [
      "annuaire de sites",
      "outils en ligne",
      "liens utiles",
      "hub web",
      "ToolNext",
    ],
  },
  ja: {
    title: "ToolNext ナビ - 人気サイトと便利なオンラインツール集",
    description:
      "ToolNext は人気サイトと便利なオンラインツールをまとめた多言語ナビゲーションハブです。日々の情報収集と作業効率を高めます。",
    keywords: [
      "サイトナビ",
      "オンラインツール",
      "便利サイト",
      "リンク集",
      "ToolNext",
    ],
  },
};

export function getLocaleMetadata(locale: string): Metadata {
  const seo = localeSeo[locale] ?? localeSeo[siteConfig.defaultLocale];
  const canonical = new URL(`/${locale}`, siteConfig.siteUrl).toString();

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        routing.locales.map((currentLocale) => [
          currentLocale,
          `/${currentLocale}`,
        ]),
      ),
    },
    openGraph: {
      type: "website",
      locale,
      url: canonical,
      siteName: siteConfig.name,
      title: seo.title,
      description: seo.description,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function getAbsoluteUrl(pathname = "") {
  return new URL(pathname, siteConfig.siteUrl).toString();
}

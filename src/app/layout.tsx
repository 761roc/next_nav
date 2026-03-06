import type { Metadata } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ToolNext | 导航站与在线工具合集",
    template: "%s | ToolNext",
  },
  description:
    "ToolNext 是一个多语言导航站，聚合知名网站与常用在线工具，帮助你快速直达高频资源。",
  applicationName: "ToolNext",
  alternates: {
    canonical: "/zh",
  },
  openGraph: {
    type: "website",
    siteName: "ToolNext",
    title: "ToolNext | 导航站与在线工具合集",
    description:
      "聚合知名网站与实用工具的多语言导航站，支持快速搜索、主题切换和跨语言访问。",
    url: `${siteUrl}/zh`,
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolNext | 导航站与在线工具合集",
    description:
      "一个专注效率的导航平台，精选知名网站与高频在线工具。",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}

export type ThemeMode = "light" | "dark" | "system";

export type Locale = "zh" | "zh-Hant" | "en" | "fr" | "ja";

export type NavLinkKind = "external" | "internal";

export type NavLinkItem = {
  id: string;
  titleKey: string;
  descriptionKey?: string;
  href: string;
  kind: NavLinkKind;
  icon?: string;
  tags?: string[];
  order?: number;
};

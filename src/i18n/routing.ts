import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh", "zh-Hant", "en", "fr", "ja"],
  defaultLocale: "zh",
  localePrefix: "always",
});

import { OfficialSiteShowcase } from "@/components/official-site-showcase";
import { setRequestLocale } from "next-intl/server";

export default async function OfficialSitePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <OfficialSiteShowcase />;
}

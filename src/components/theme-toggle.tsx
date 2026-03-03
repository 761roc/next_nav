"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import type { ThemeMode } from "@/types";

const MODES: ThemeMode[] = ["light", "dark", "system"];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("theme");
  const currentTheme = theme ?? "light";

  return (
    <div className="control-group" role="group" aria-label={t("label")}>
      {MODES.map((mode) => {
        const active = currentTheme === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            className={`chip ${active ? "chip-active" : ""}`}
          >
            {t(mode)}
          </button>
        );
      })}
    </div>
  );
}

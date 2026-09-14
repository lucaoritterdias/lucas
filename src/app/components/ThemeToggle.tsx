"use client";

import { IconMoon, IconSun } from "./icons";
import { useTheme } from "./useTheme";

/** Both icons are rendered; CSS shows the one matching <html data-theme>, so SSR never guesses wrong. */
export function ThemeToggle({ english }: { english: boolean }) {
  const { toggle } = useTheme();
  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      aria-label={english ? "Toggle light and dark theme" : "Alternar tema claro e escuro"}
      title={english ? "Theme" : "Tema"}
      onClick={(event) => toggle({ x: event.clientX, y: event.clientY })}
    >
      <span className="theme-icon-light"><IconSun /></span>
      <span className="theme-icon-dark"><IconMoon /></span>
    </button>
  );
}

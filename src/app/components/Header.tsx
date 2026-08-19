"use client";

import { Logo } from "./Logo";
import { IconMoon, IconSun } from "./icons";
import type { Origin, Theme } from "./useTheme";

export function Header({
  onOpen,
  theme,
  onToggleTheme,
}: {
  onOpen: (id: "work" | "about" | "contact") => void;
  theme: Theme;
  onToggleTheme: (origin?: Origin) => void;
}) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#inicio" className="brand" aria-label="Início">
          <Logo />
        </a>

        <nav className="site-nav">
          <button type="button" className="nav-link" onClick={() => onOpen("work")}>
            Trabalhos
          </button>
          <button type="button" className="nav-link" onClick={() => onOpen("about")}>
            Sobre
          </button>
          <button type="button" className="nav-link" onClick={() => onOpen("contact")}>
            Contato
          </button>
          <span className="nav-sep" />
          <button
            type="button"
            className="icon-btn"
            onClick={(e) => onToggleTheme({ x: e.clientX, y: e.clientY })}
            aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            title={theme === "dark" ? "Tema claro" : "Tema escuro"}
          >
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>
        </nav>
      </div>
    </header>
  );
}

"use client";

import { useMemo } from "react";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";
import { PROFILE, PROJECTS } from "../data";
import {
  IconArrowRight,
  IconArticle,
  IconGithub,
  IconGrid,
  IconInstagram,
  IconMail,
  IconMoon,
  IconSun,
  IconWhatsapp,
} from "./icons";
import type { Origin, Theme } from "./useTheme";

/* deterministic starfield so server and client agree */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SOCIALS = [
  { href: PROFILE.github, label: "GitHub", Icon: IconGithub },
  { href: PROFILE.instagram, label: "Instagram", Icon: IconInstagram },
  { href: PROFILE.whatsapp, label: "WhatsApp", Icon: IconWhatsapp },
  { href: `mailto:${PROFILE.email}`, label: "E-mail", Icon: IconMail },
  { href: PROFILE.blog, label: "Artigos", Icon: IconArticle },
];

export function MobileProfile({
  onOpen,
  theme,
  onToggleTheme,
}: {
  onOpen: (id: "work" | "about" | "contact") => void;
  theme: Theme;
  onToggleTheme: (origin?: Origin) => void;
}) {
  const stars = useMemo(() => {
    const rnd = mulberry32(99117);
    return Array.from({ length: 46 }, () => ({
      left: rnd() * 100,
      top: rnd() * 88,
      size: 1 + rnd() * 1.8,
      dur: 2.4 + rnd() * 4,
      delay: rnd() * 5,
    }));
  }, []);

  return (
    <div className="mp">
      <header className="mp-top">
        <span className="mp-logo" aria-hidden>
          <Logo />
        </span>
        <div className="mp-top-right">
          <span className="mp-status">
            <i />
            Disponível
          </span>
          <button
            type="button"
            className="mp-round"
            onClick={(e) => onToggleTheme({ x: e.clientX, y: e.clientY })}
            aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
          >
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </header>

      {/* hero card */}
      <div className="mp-card">
        <span className="mp-card-sky" aria-hidden />
        <span className="mp-card-glow" aria-hidden />
        <span className="mp-card-orb" aria-hidden />
        <span className="mp-card-stars" aria-hidden>
          {stars.map((s, i) => (
            <span
              key={i}
              className="star"
              style={
                {
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  "--dur": `${s.dur}s`,
                  "--delay": `${s.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </span>
        <span className="mp-card-figure">
          <Avatar view="tight" className="avatar-float" idSuffix="mp" />
        </span>
      </div>

      {/* identity */}
      <span className="mp-face">
        <Avatar view="head" idSuffix="mpFace" />
      </span>

      <div className="mp-name-row">
        <h1 className="mp-name">{PROFILE.name}</h1>
        <button type="button" className="mp-contact" onClick={() => onOpen("contact")}>
          Contato
        </button>
      </div>

      <p className="mp-handle">
        {PROFILE.instagramUser}
        <span className="mp-dot" />
        <b>{PROFILE.role}</b>
      </p>

      <div className="mp-socials">
        {SOCIALS.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
          >
            <Icon />
          </a>
        ))}
      </div>

      <p className="mp-tagline">Pense grande. Eu construo o sistema.</p>
      <p className="mp-bio">
        Escrevo software desde os 14 anos. Hoje sou CTO e sócio da Polvor Tecnologia e Software,
        onde lidero arquitetura, infraestrutura e produto para transformar necessidade de negócio em
        sistema que roda, escala e dá resultado.
      </p>

      <div className="mp-section">
        <h2>Trabalhos</h2>
        <button type="button" onClick={() => onOpen("work")}>
          Ver todos ({PROJECTS.length})
        </button>
      </div>

      <ul className="mp-list">
        {PROJECTS.map((p) => (
          <li key={p.slug}>
            <button type="button" onClick={() => onOpen("work")}>
              <span className="mp-thumb" style={{ background: p.glow }}>
                {p.name.charAt(0)}
              </span>
              <span className="mp-row-body">
                <span className="mp-row-head">
                  <b>{p.name}</b>
                  <em>{p.statusLabel}</em>
                </span>
                <span className="mp-row-desc">{p.summary}</span>
              </span>
              <IconArrowRight />
            </button>
          </li>
        ))}
      </ul>

      <p className="mp-foot">© {new Date().getFullYear()} Lucas Ritter Dias</p>

      <nav className="mp-dock" aria-label="Navegação">
        <button type="button" onClick={() => onOpen("work")} aria-label="Trabalhos">
          <IconGrid />
        </button>
        <button type="button" onClick={() => onOpen("contact")} aria-label="Contato">
          <IconWhatsapp />
        </button>
        <button type="button" onClick={() => onOpen("about")} aria-label="Sobre">
          <span className="mp-dock-face">
            <Avatar view="head" idSuffix="mpDock" />
          </span>
        </button>
      </nav>
    </div>
  );
}

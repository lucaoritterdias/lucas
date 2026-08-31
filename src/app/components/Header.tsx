"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import lucasAvatar from "../lucas.png";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const english = pathname.startsWith("/en");
  const prefix = english ? "/en" : "";
  const ptPath = pathname
    .replace(/^\/en\/articles/, "/artigos")
    .replace(/^\/en\/work/, "/trabalhos")
    .replace(/^\/en\/about/, "/sobre")
    .replace(/^\/en\/contact/, "/contato")
    .replace(/^\/en\/library/, "/biblioteca")
    .replace(/^\/en$/, "/");
  const enPath = pathname === "/" ? "/en" : pathname
    .replace(/^\/artigos/, "/en/articles")
    .replace(/^\/trabalhos/, "/en/work")
    .replace(/^\/sobre/, "/en/about")
    .replace(/^\/contato/, "/en/contact")
    .replace(/^\/biblioteca/, "/en/library");
  const localizedLibrary = english ? "/en/library" : "/biblioteca";
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", close);
    document.body.classList.add("is-locked");
    return () => { document.removeEventListener("keydown", close); document.body.classList.remove("is-locked"); };
  }, [menuOpen]);
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href={english ? "/en" : "/"} className="brand" aria-label={english ? "Home" : "Início"} style={{ display: "inline-flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Image
            className="brand-avatar"
            src={lucasAvatar}
            alt=""
            width={34}
            height={34}
            priority
            style={{ width: 34, height: 34, objectFit: "cover", objectPosition: "50% 20%", borderRadius: "50%", flexShrink: 0 }}
          />
          <span style={{ whiteSpace: "nowrap", fontWeight: 700, fontStyle: "italic", letterSpacing: "-0.035em" }}>Lucas Ritter Dias</span>
        </Link>

        <nav className="site-nav">
          <Link className="nav-link" href={`${prefix}/${english ? "work" : "trabalhos"}`}>{english ? "Work" : "Trabalhos"}</Link>
          <Link className="nav-link" href={`${prefix}/${english ? "articles" : "artigos"}`}>{english ? "Articles" : "Artigos"}</Link>
          <Link className="nav-link" href={localizedLibrary}>{english ? "Library" : "Biblioteca"}</Link>
          <Link className="nav-link" href={`${prefix}/${english ? "about" : "sobre"}`}>{english ? "About" : "Sobre"}</Link>
          <Link className="nav-link" href={`${prefix}/${english ? "contact" : "contato"}`}>{english ? "Contact" : "Contato"}</Link>
          <span className="language-switch"><Link data-active={!english} href={ptPath}>PT</Link><i /><Link data-active={english} href={enPath}>EN</Link></span>
        </nav>
        <button className="mobile-menu-button" type="button" aria-label={menuOpen ? (english ? "Close menu" : "Fechar menu") : (english ? "Open menu" : "Abrir menu")} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button>
      </div>
      <div className="mobile-menu-backdrop" data-open={menuOpen} onClick={() => setMenuOpen(false)} />
      <aside className="mobile-menu" data-open={menuOpen} aria-hidden={!menuOpen}>
        <div className="mobile-menu-count">{english ? "Navigation" : "Navegação"} · 05</div>
        <nav>
          <Link onClick={() => setMenuOpen(false)} href={`${prefix}/${english ? "work" : "trabalhos"}`}><span>01</span>{english ? "Work" : "Trabalhos"}</Link>
          <Link onClick={() => setMenuOpen(false)} href={`${prefix}/${english ? "articles" : "artigos"}`}><span>02</span>{english ? "Articles" : "Artigos"}</Link>
          <Link onClick={() => setMenuOpen(false)} href={localizedLibrary}><span>03</span>{english ? "Library" : "Biblioteca"}</Link>
          <Link onClick={() => setMenuOpen(false)} href={`${prefix}/${english ? "about" : "sobre"}`}><span>04</span>{english ? "About" : "Sobre"}</Link>
          <Link onClick={() => setMenuOpen(false)} href={`${prefix}/${english ? "contact" : "contato"}`}><span>05</span>{english ? "Contact" : "Contato"}</Link>
        </nav>
        <div className="mobile-language"><span>{english ? "Language" : "Idioma"}</span><Link onClick={() => setMenuOpen(false)} data-active={!english} href={ptPath}>Português</Link><Link onClick={() => setMenuOpen(false)} data-active={english} href={enPath}>English</Link></div>
      </aside>
    </header>
  );
}

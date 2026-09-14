"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type FormEvent } from "react";
import { PROFILE } from "../data";
import { IconGithub, IconRss } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

const SEARCH_DOMAIN = "lucasritterdias.com.br";

const ROUTES: [pt: string, en: string][] = [
  ["/artigos", "/en/articles"],
  ["/contato", "/en/contact"],
];

const LABELS = {
  pt: ["Artigos", "Contato"],
  en: ["Articles", "Contact"],
};

/** Same page in the other language — every localized route shares its slug. */
function counterpart(pathname: string, toEnglish: boolean) {
  if (toEnglish) {
    if (pathname === "/") return "/en";
    const hit = ROUTES.find(([pt]) => pathname.startsWith(pt));
    return hit ? pathname.replace(hit[0], hit[1]) : "/en";
  }
  const hit = ROUTES.find(([, en]) => pathname.startsWith(en));
  return hit ? pathname.replace(hit[1], hit[0]) : "/";
}

function SiteSearch({ english }: { english: boolean }) {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.current?.focus();
        input.current?.select();
      } else if (event.key === "Escape" && document.activeElement === input.current) {
        input.current?.blur();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = input.current?.value.trim();
    if (!query) return;
    window.location.href = `https://duckduckgo.com/?q=${encodeURIComponent(`site:${SEARCH_DOMAIN} ${query}`)}`;
  };

  return (
    <form className="site-search" role="search" action="https://duckduckgo.com/" method="get" onSubmit={submit}>
      {/* no-JS fallback: DuckDuckGo's own site-restriction parameter */}
      <input type="hidden" name="sites" value={SEARCH_DOMAIN} />
      <input
        ref={input}
        type="search"
        name="q"
        placeholder={english ? "Search the site (DuckDuckGo)…" : "Buscar no site (DuckDuckGo)…"}
        aria-label={english ? "Search the site with DuckDuckGo" : "Buscar no site com DuckDuckGo"}
      />
      <kbd aria-hidden>Ctrl K</kbd>
    </form>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const english = pathname === "/en" || pathname.startsWith("/en/");
  const labels = english ? LABELS.en : LABELS.pt;

  return (
    <header className="site-header" id="top">
      <Link className="wordmark" href={english ? "/en" : "/"}>
        LucasRitterDias.com.br
      </Link>

      <nav className="site-nav" aria-label={english ? "Main" : "Principal"}>
        {ROUTES.map((route, index) => {
          const href = english ? route[1] : route[0];
          return (
            <Link
              key={href}
              className="nav-link"
              href={href}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              {labels[index]}
            </Link>
          );
        })}
        {/* plain <a>: it's a text file, not a page to prefetch */}
        <a className="nav-link" href="/llms.txt">
          llms.txt
        </a>
      </nav>

      <div className="header-tools">
        <a className="icon-button header-github" href={PROFILE.github} target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub">
          <IconGithub />
        </a>
        <SiteSearch english={english} />
        <a className="icon-button header-rss" href={english ? "/en/feed.xml" : "/feed.xml"} aria-label="RSS" title="RSS">
          <IconRss />
        </a>
        <div className="lang-switch" aria-label={english ? "Language" : "Idioma"}>
          <Link href={english ? counterpart(pathname, false) : pathname} aria-current={english ? undefined : "true"} hrefLang="pt-BR">
            PT
          </Link>
          <span aria-hidden>|</span>
          <Link href={english ? pathname : counterpart(pathname, true)} aria-current={english ? "true" : undefined} hrefLang="en">
            EN
          </Link>
        </div>
        <ThemeToggle english={english} />
      </div>
    </header>
  );
}

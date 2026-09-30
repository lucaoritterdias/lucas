"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROFILE } from "../data";
import { IconGithub, IconInstagram, IconLinkedin, IconWhatsapp } from "./icons";
import { LABELS, ROUTES } from "./SiteHeader";

const COPY = {
  pt: {
    bio: "Engenheiro de software, CTO e sócio da Polvor. Escrevo sobre engenharia, produto e as decisões que fazem o trabalho permanecer.",
    home: "Início",
    navigate: "Navegar",
    more: "Mais",
    elsewhere: "Contato",
    rss: "Feed RSS",
    rights: "Todos os direitos reservados.",
    top: "Voltar ao topo",
  },
  en: {
    bio: "Software engineer, CTO and partner at Polvor. I write about engineering, product and the decisions that make work last.",
    home: "Home",
    navigate: "Navigate",
    more: "More",
    elsewhere: "Contact",
    rss: "RSS feed",
    rights: "All rights reserved.",
    top: "Back to top",
  },
};

export function SiteFooter({ year }: { year: number }) {
  const pathname = usePathname();
  const english = pathname === "/en" || pathname.startsWith("/en/");
  const t = english ? COPY.en : COPY.pt;
  const labels = english ? LABELS.en : LABELS.pt;

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link className="wordmark" href={english ? "/en" : "/"}>
            <Image className="wordmark-avatar" src="/library/lucas-perfil.jpeg" alt="" width={28} height={28} sizes="28px" />
            LucasRitterDias.com.br
          </Link>
          <p>{t.bio}</p>
          <a className="footer-email" href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
        </div>

        <nav className="footer-column" aria-label={t.navigate}>
          <h2>{t.navigate}</h2>
          <Link href={english ? "/en" : "/"}>{t.home}</Link>
          {ROUTES.map((route, index) => (
            <Link key={route[0]} href={english ? route[1] : route[0]}>{labels[index]}</Link>
          ))}
        </nav>

        <nav className="footer-column" aria-label={t.more}>
          <h2>{t.more}</h2>
          <a href={english ? "/en/feed.xml" : "/feed.xml"}>{t.rss}</a>
          <a href="/llms.txt">llms.txt</a>
          <a href="/sitemap.xml">Sitemap</a>
        </nav>

        <div className="footer-column">
          <h2>{t.elsewhere}</h2>
          <a href={PROFILE.linkedin} target="_blank" rel="noreferrer"><IconLinkedin /> LinkedIn</a>
          <a href={PROFILE.github} target="_blank" rel="noreferrer"><IconGithub /> GitHub</a>
          <a href={PROFILE.instagram} target="_blank" rel="noreferrer"><IconInstagram /> Instagram</a>
          <a href={PROFILE.whatsapp} target="_blank" rel="noreferrer"><IconWhatsapp /> WhatsApp</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-note">© {year} Lucas Ritter Dias. {t.rights}</p>
        <a className="back-top" href="#top">{t.top} ↑</a>
      </div>
    </footer>
  );
}

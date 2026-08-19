"use client";

import { PROFILE } from "../data";
import { IconArticle, IconGithub, IconInstagram, IconMail, IconWhatsapp } from "./icons";

const LINKS = [
  { href: PROFILE.github, tip: PROFILE.githubUser, label: "GitHub", Icon: IconGithub },
  { href: PROFILE.instagram, tip: PROFILE.instagramUser, label: "Instagram", Icon: IconInstagram },
  { href: PROFILE.whatsapp, tip: PROFILE.phonePretty, label: "WhatsApp", Icon: IconWhatsapp },
  { href: `mailto:${PROFILE.email}`, tip: PROFILE.email, label: "E-mail", Icon: IconMail },
  { href: PROFILE.blog, tip: "Artigos na Polvor", label: "Artigos", Icon: IconArticle },
];

export function SocialRail() {
  return (
    <div className="rail">
      {LINKS.map(({ href, tip, label, Icon }) => (
        <a
          key={label}
          href={href}
          data-tip={tip}
          aria-label={label}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}

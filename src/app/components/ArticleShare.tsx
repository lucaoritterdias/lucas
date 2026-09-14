"use client";

import { useRef, useState } from "react";
import { IconBluesky, IconInstagram, IconLinkedin, IconWhatsapp, IconX } from "./icons";

const COPY = {
  pt: { label: "Compartilhar", on: "Compartilhar no", instagram: "Copiar link para o Instagram", copied: "Link copiado. Cole no Instagram." },
  en: { label: "Share", on: "Share on", instagram: "Copy link for Instagram", copied: "Link copied. Paste it on Instagram." },
};

export function ArticleShare({ title, url, locale }: { title: string; url: string; locale: "pt" | "en" }) {
  const t = COPY[locale];
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const text = `${title} ${url}`;

  const links = [
    { name: "X", href: `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, Icon: IconX },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, Icon: IconLinkedin },
    { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(text)}`, Icon: IconWhatsapp },
    { name: "Bluesky", href: `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`, Icon: IconBluesky },
  ];

  /* Instagram has no web share intent: phones get the native sheet (which lists
     Instagram), everything else gets the link on the clipboard. */
  const shareInstagram = async () => {
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* dismissed — fall through to copying */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(t.instagram, url);
    }
  };

  return (
    <div className="share">
      <p className="share-label">{t.label}</p>
      <div className="share-list">
        {links.map(({ name, href, Icon }) => (
          <a key={name} className="icon-button" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${t.on} ${name}`} title={name}>
            <Icon />
          </a>
        ))}
        <button type="button" className="icon-button" onClick={shareInstagram} aria-label={t.instagram} title="Instagram">
          <IconInstagram />
        </button>
      </div>
      <p className="share-status" aria-live="polite">
        {copied ? t.copied : ""}
      </p>
    </div>
  );
}

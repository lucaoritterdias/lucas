"use client";

import { useState } from "react";
import { Avatar } from "./Avatar";
import { Modal } from "./Modal";
import { PROFILE } from "../data";
import {
  IconArrowUpRight,
  IconCheck,
  IconClose,
  IconCopy,
  IconMail,
  IconPhone,
  IconWhatsapp,
} from "./icons";

function CopyRow({
  icon,
  title,
  value,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1700);
    } catch {
      /* clipboard blocked — the link itself still works */
    }
  };

  return (
    <a className="btn-row" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
      <span className="btn-row-icon">{icon}</span>
      <span className="btn-row-body">
        <b>{title}</b>
        <span>{value}</span>
      </span>
      <button
        type="button"
        className="copy-btn"
        data-copied={copied}
        onClick={copy}
        aria-label={`Copiar ${title}`}
      >
        {copied ? <IconCheck /> : <IconCopy />}
      </button>
    </a>
  );
}

export function ContactModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal variant="card" onClose={onClose} labelledBy="contact-title">
      <div className="card-body scroll-thin" style={{ paddingTop: 22, position: "relative" }}>
        <button
          type="button"
          className="panel-close"
          onClick={onClose}
          aria-label="Fechar"
          style={{ position: "absolute", top: 16, right: 16 }}
        >
          <IconClose />
        </button>

        <div className="trio">
          <span className="t-avatar">
            <Avatar view="head" idSuffix="contact" />
          </span>
          <span className="t-wa">
            <IconWhatsapp />
          </span>
          <span className="t-mail">
            <IconMail />
          </span>
        </div>

        <div className="pill-row">
          <span className="pill">{PROFILE.role}</span>
          <span className="pill" data-tone="ok">
            Disponível
          </span>
        </div>

        <h2 className="contact-title" id="contact-title">
          Vamos tirar sua ideia do papel?
        </h2>

        <div className="stat-row">
          <div className="stat">
            <b>+10</b>
            <span>Anos</span>
          </div>
          <div className="stat">
            <b>2</b>
            <span>Empresas</span>
          </div>
          <div className="stat">
            <b>CTO</b>
            <span>Polvor</span>
          </div>
        </div>

        <a className="btn-primary" href={PROFILE.whatsapp} target="_blank" rel="noreferrer">
          Chamar no WhatsApp
          <IconArrowUpRight />
        </a>

        <CopyRow
          icon={<IconMail />}
          title="E-mail"
          value={PROFILE.email}
          href={`mailto:${PROFILE.email}`}
        />
        <CopyRow
          icon={<IconPhone />}
          title="Telefone"
          value={PROFILE.phonePretty}
          href={`tel:${PROFILE.phoneRaw}`}
        />
        <CopyRow
          icon={<IconMail />}
          title="Gmail"
          value={PROFILE.emailAlt}
          href={`mailto:${PROFILE.emailAlt}`}
        />
      </div>
    </Modal>
  );
}

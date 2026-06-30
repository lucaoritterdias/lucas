"use client";

import { useState } from "react";
import Image from "next/image";
import lucasPhoto from "./lucas.png";

export default function Home() {
  return (
    <main className="page">
      <div className="layout">
        <section className="photo-col">
          <div className="photo-frame">
            <Image
              src={lucasPhoto}
              alt="Lucas Ritter Dias"
              fill
              priority
              sizes="(max-width: 860px) 80vw, 480px"
              className="photo"
            />
          </div>
          <div className="photo-caption">
            <span className="photo-name" data-text="Lucas Ritter Dias">
              Lucas Ritter Dias
            </span>
            <span className="photo-role">CTO &middot; Software Engineer</span>
          </div>
        </section>

        <section className="info-col">
          <div className="intro">
            <p className="intro-lead">
              Olá, eu sou <strong>Lucas Ritter Dias</strong>.
            </p>
            <p>
              CTO, Software Engineer e alguém que ainda gosta de escrever
              código todos os dias.
            </p>
            <p>
              Atualmente trabalho principalmente com arquitetura de software,
              desenvolvimento full stack, TypeScript, NestJS, Next.js,
              Docker, cloud, automações, integrações e produtos SaaS. Também
              sou fundador da{" "}
              <a
                href="https://www.polvor.com"
                target="_blank"
                rel="noreferrer"
                className="info-link"
              >
                Polvor
              </a>
              , onde ajudo empresas a transformar ideias em software sob
              medida e plataformas digitais escaláveis.
            </p>
            <p>
              Quando não estou desenvolvendo ou desenhando arquiteturas,
              provavelmente estou estudando alguma tecnologia nova, testando
              ferramentas, planejando novos produtos ou discutindo como
              construir sistemas melhores do que os que fiz ontem.
            </p>
            <p>
              Acredito que tecnologia é uma das ferramentas mais poderosas
              para criar valor. E sigo construindo, aprendendo e evoluindo um
              sistema por vez.
            </p>
          </div>

          <Divider />

          <div className="ventures">
            <h2 className="contacts-title">Empresas fundadas</h2>
            <div className="ventures-grid">
              <VentureCard
                name="Polvor Tecnologia e Software"
                domain="www.polvor.com"
                href="https://www.polvor.com"
                delay={0}
              />
              <VentureCard
                name="Gestor de Agência"
                domain="www.gestordeagencias.com"
                href="https://www.gestordeagencias.com"
                status="Construindo..."
                delay={50}
              />
            </div>
          </div>

          <Divider />

          <div className="contacts">
            <h2 className="contacts-title">Contato</h2>
            <div className="contacts-grid">
              <ContactCard
                icon={<IconMail />}
                label="email"
                copyText="lucas@polvor.com"
                href="mailto:lucas@polvor.com"
                delay={0}
              >
                lucas@polvor.com
              </ContactCard>
              <ContactCard
                icon={<IconMail />}
                label="gmail"
                copyText="lucasritterdiasrd@gmail.com"
                href="mailto:lucasritterdiasrd@gmail.com"
                delay={45}
              >
                lucasritterdiasrd@gmail.com
              </ContactCard>
              <ContactCard
                icon={<IconPhone />}
                label="telefone"
                copyText="+5551998135730"
                href="tel:+5551998135730"
                delay={90}
              >
                (51) 9 9813-5730
              </ContactCard>
              <ContactCard
                icon={<IconGithub />}
                label="github"
                copyText="lucaoritterdias"
                href="https://github.com/lucaoritterdias"
                delay={135}
              >
                lucaoritterdias
              </ContactCard>
              <ContactCard
                icon={<IconInstagram />}
                label="instagram"
                copyText="@ritterdiaslucas"
                href="https://www.instagram.com/ritterdiaslucas"
                delay={180}
              >
                ritterdiaslucas
              </ContactCard>
              <ContactCard
                icon={<IconArticle />}
                label="artigos"
                copyText="https://www.polvor.com/blog/autor/lucas-ritter-dias"
                href="https://www.polvor.com/blog/autor/lucas-ritter-dias"
                delay={225}
              >
                blog da Polvor
              </ContactCard>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// ── Shared ─────────────────────────────────────────

function ContactCard({
  icon,
  label,
  copyText,
  href,
  delay = 0,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  copyText: string;
  href: string;
  delay?: number;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const ext = href.startsWith("http");

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <a
      href={href}
      className="contact-card"
      style={{ animationDelay: `${delay}ms` }}
      target={ext ? "_blank" : undefined}
      rel={ext ? "noreferrer" : undefined}
    >
      <span className="contact-icon" aria-hidden>
        {icon}
      </span>
      <span className="contact-body">
        <span className="contact-label">{label}</span>
        <span className="contact-value">{children}</span>
      </span>
      <button
        type="button"
        className={`contact-copy ${copied ? "is-copied" : ""}`}
        onClick={handleCopy}
        aria-label={`Copiar ${label}`}
      >
        {copied ? <IconCheck /> : <IconCopy />}
      </button>
    </a>
  );
}

function VentureCard({
  name,
  domain,
  href,
  status,
  delay = 0,
}: {
  name: string;
  domain: string;
  href: string;
  status?: string;
  delay?: number;
}) {
  return (
    <a
      href={href}
      className="venture-card"
      style={{ animationDelay: `${delay}ms` }}
      target="_blank"
      rel="noreferrer"
    >
      <span className="venture-body">
        <span className="venture-name">{name}</span>
        <span className="venture-domain">{domain}</span>
      </span>
      {status && <span className="venture-status">{status}</span>}
    </a>
  );
}

function Divider() {
  return <div className="section-divider" />;
}

// ── Icons ──────────────────────────────────────────

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconGithub() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
    </svg>
  );
}

function IconArticle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

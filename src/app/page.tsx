"use client";

import { useState, useEffect } from "react";

type SectionId = "about" | "contact" | "polvor";

const TABS: { id: SectionId; label: string }[] = [
  { id: "about", label: "Sobre" },
  { id: "contact", label: "Contato" },
  { id: "polvor", label: "Polvor" },
];

export default function Home() {
  const [active, setActive] = useState<SectionId>("about");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let rafId: number;
    const handle = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMouse({
          x: (e.clientX / window.innerWidth - 0.5) * 26,
          y: (e.clientY / window.innerHeight - 0.5) * 26,
        });
      });
    };
    window.addEventListener("mousemove", handle, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handle);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <main className="page">
      <div
        className="bg-orb orb-1"
        aria-hidden
        style={{ transform: `translate(${mouse.x}px, ${mouse.y}px)` }}
      />
      <div
        className="bg-orb orb-2"
        aria-hidden
        style={{
          transform: `translate(${-mouse.x * 0.6}px, ${-mouse.y * 0.6}px)`,
        }}
      />
      <div className="bg-dots" aria-hidden />

      <div className="wrapper">
        <header className="hero">
          <h1 className="name" data-text="Lucas Ritter Dias">
            Lucas Ritter Dias
          </h1>
          <p className="tagline">
            Desenvolvedor de Software&nbsp;&middot;&nbsp;CTO&nbsp;&middot;&nbsp;
            <a
              href="https://www.polvor.com"
              target="_blank"
              rel="noreferrer"
              className="hero-link"
            >
              Polvor
            </a>
          </p>
        </header>

        <nav className="tab-nav" aria-label="Seções">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${active === tab.id ? "is-active" : ""}`}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="content-card" aria-live="polite">
          {active === "about" && <AboutSection key="about" />}
          {active === "contact" && <ContactSection key="contact" />}
          {active === "polvor" && <PolvorSection key="polvor" />}
        </section>
      </div>
    </main>
  );
}

// ── Shared ─────────────────────────────────────────

function InfoRow({
  label,
  delay = 0,
  children,
}: {
  label: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="info-row" style={{ animationDelay: `${delay}ms` }}>
      <span className="info-label">{label}</span>
      <span className="info-value">{children}</span>
    </div>
  );
}

function InfoLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const ext = href.startsWith("http");
  return (
    <a
      href={href}
      className="info-link"
      target={ext ? "_blank" : undefined}
      rel={ext ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

function CopyRow({
  label,
  copyText,
  href,
  delay = 0,
  children,
}: {
  label: string;
  copyText: string;
  href?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div
      className="info-row is-copyable"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="info-label">{label}</span>
      <span className="info-value">
        {href ? <InfoLink href={href}>{children}</InfoLink> : children}
      </span>
      <button
        type="button"
        className={`copy-btn ${copied ? "is-copied" : ""}`}
        onClick={handleCopy}
        aria-label={`Copiar ${label}`}
      >
        {copied ? "✓ copiado" : "copy"}
      </button>
    </div>
  );
}

function Divider() {
  return <div className="section-divider" />;
}

// ── Sections ───────────────────────────────────────

function AboutSection() {
  return (
    <div className="section-content">
      <InfoRow label="nome" delay={0}>
        Lucas Ritter Dias
      </InfoRow>
      <InfoRow label="idade" delay={50}>
        21 anos
      </InfoRow>
      <InfoRow label="local" delay={100}>
        Rio Grande do Sul
      </InfoRow>
      <Divider />
      <InfoRow label="sobre" delay={160}>
        Software Engineer — Construindo...
      </InfoRow>
      <InfoRow label="empresa" delay={210}>
        <InfoLink href="https://www.polvor.com">
          Polvor Tecnologia e Software
        </InfoLink>
      </InfoRow>
      <InfoRow label="cargo" delay={260}>
        <span className="info-accent">Diretor de Tecnologia (CTO)</span>
      </InfoRow>
    </div>
  );
}

function ContactSection() {
  return (
    <div className="section-content">
      <CopyRow
        label="email"
        copyText="lucas@polvor.com"
        href="mailto:lucas@polvor.com"
        delay={0}
      >
        lucas@polvor.com
      </CopyRow>
      <CopyRow
        label="gmail"
        copyText="lucasritterdiasrd@gmail.com"
        href="mailto:lucasritterdiasrd@gmail.com"
        delay={55}
      >
        lucasritterdiasrd@gmail.com
      </CopyRow>
      <CopyRow
        label="tel"
        copyText="+5551998135730"
        href="tel:+5551998135730"
        delay={110}
      >
        (51) 9 9813-5730
      </CopyRow>
      <CopyRow
        label="github"
        copyText="lucaoritterdias"
        href="https://github.com/lucaoritterdias"
        delay={165}
      >
        lucaoritterdias
      </CopyRow>
      <CopyRow
        label="instagram"
        copyText="@lucas.ritterdias"
        href="https://www.instagram.com/lucas.ritterdias/"
        delay={220}
      >
        lucas.ritterdias
      </CopyRow>
    </div>
  );
}

function PolvorSection() {
  return (
    <div className="section-content">
      <CopyRow
        label="site"
        copyText="www.polvor.com"
        href="https://www.polvor.com"
        delay={0}
      >
        www.polvor.com
      </CopyRow>
      <CopyRow
        label="email"
        copyText="oi@polvor.com"
        href="mailto:oi@polvor.com"
        delay={55}
      >
        oi@polvor.com
      </CopyRow>
      <CopyRow
        label="instagram"
        copyText="polvortecnologia"
        href="https://www.instagram.com/polvortecnologia/"
        delay={110}
      >
        polvortecnologia
      </CopyRow>
      <CopyRow
        label="linkedin"
        copyText="https://www.linkedin.com/company/polvor-tecnologia-e-software/"
        href="https://www.linkedin.com/company/polvor-tecnologia-e-software/"
        delay={165}
      >
        polvor-tecnologia-e-software
      </CopyRow>
      <CopyRow
        label="whatsapp"
        copyText="+5551998135730"
        href="tel:+5551998135730"
        delay={220}
      >
        (51) 9 9813-5730
      </CopyRow>
    </div>
  );
}

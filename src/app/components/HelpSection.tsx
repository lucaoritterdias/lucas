import type { Interest } from "../contact-form";
import { ContactTrigger } from "./ContactDialog";
import type { ReactNode } from "react";

const icon = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

const ICONS: Record<string, ReactNode> = {
  build: (
    <svg {...icon}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 8.5h18M9 13l-2 2 2 2M15 13l2 2-2 2" />
    </svg>
  ),
  lead: (
    <svg {...icon}>
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="5" cy="18" r="2.2" />
      <circle cx="19" cy="18" r="2.2" />
      <path d="M12 7.2v4.3M12 11.5l-5.3 4.7M12 11.5l5.3 4.7" />
    </svg>
  ),
  audit: (
    <svg {...icon}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.4-4.4M7 10.5h1.6l1.2-2.4 1.6 4.8 1.2-2.4H14" />
    </svg>
  ),
  mentor: (
    <svg {...icon}>
      <circle cx="8" cy="7.5" r="3" />
      <path d="M2.5 20c.6-3.3 2.8-5.5 5.5-5.5s4.9 2.2 5.5 5.5" />
      <path d="M16 11.5a2.5 2.5 0 1 0 0-5M17.5 14.6c2.1.5 3.6 2.5 4 5.4" />
    </svg>
  ),
};

/** each service card opens the contact dialog with the matching interest */
const INTEREST_BY_ICON: Record<keyof typeof ICONS, Interest> = { build: "project", lead: "cto", audit: "audit", mentor: "mentoring" };

type Offer = { key: keyof typeof ICONS; tag?: string; title: string; text: string; cta: string };

const COPY = {
  pt: {
    eyebrow: "Serviços",
    before: "Como posso",
    circled: "te ajudar?",
    intro: "Formas de trabalhar juntos, a partir do que já construí e entreguei.",
    contact: "/contato",
    offers: [
      {
        key: "build",
        tag: "Software sob medida",
        title: "Projeto digital com a Polvor",
        text: "Tem uma ideia ou um processo que precisa virar software? Site, app, sistema ou integração: com o time da Polvor, levo do escopo ao deploy, com processo e infraestrutura de quem já entregou mais de 100 projetos.",
        cta: "Falar sobre seu projeto",
      },
      {
        key: "lead",
        title: "CTO sob demanda",
        text: "Para empresas sem liderança técnica dedicada: arquitetura, escolha de stack, infraestrutura, processo de entrega e formação do time. Decisões técnicas com visão de negócio, no ritmo que a empresa precisa.",
        cta: "Conversar sobre sua empresa",
      },
      {
        key: "audit",
        title: "Diagnóstico técnico",
        text: "Sistema lento, caro ou frágil? Reviso arquitetura, infraestrutura, deploy e observabilidade, e entrego um plano priorizado do que simplificar, corrigir e manter.",
        cta: "Pedir um diagnóstico",
      },
      {
        key: "mentor",
        title: "Mentoria para devs",
        text: "Do freelancer à empresa: como precificar, escolher clientes, organizar entregas e transformar projetos avulsos em operação. Conversas práticas com quem fez esse caminho.",
        cta: "Quero conversar",
      },
    ] as Offer[],
  },
  en: {
    eyebrow: "Services",
    before: "How can I",
    circled: "help you?",
    intro: "Ways to work together, based on what I have already built and delivered.",
    contact: "/en/contact",
    offers: [
      {
        key: "build",
        tag: "Custom software",
        title: "Digital project with Polvor",
        text: "Have an idea or a process that needs to become software? Website, app, system or integration: with the Polvor team, I take it from scope to deployment, with the process and infrastructure of someone who has delivered over 100 projects.",
        cta: "Talk about your project",
      },
      {
        key: "lead",
        title: "Fractional CTO",
        text: "For companies without dedicated technical leadership: architecture, stack choices, infrastructure, delivery process and team building. Technical decisions with a business view, at the pace the company needs.",
        cta: "Talk about your company",
      },
      {
        key: "audit",
        title: "Technical assessment",
        text: "Slow, expensive or fragile system? I review architecture, infrastructure, deployment and observability, and deliver a prioritized plan of what to simplify, fix and keep.",
        cta: "Request an assessment",
      },
      {
        key: "mentor",
        title: "Mentoring for developers",
        text: "From freelancer to company: how to price, choose clients, organize delivery and turn one-off projects into an operation. Practical conversations with someone who walked that path.",
        cta: "Let's talk",
      },
    ] as Offer[],
  },
};

export function HelpSection({ locale }: { locale: "pt" | "en" }) {
  const t = COPY[locale];

  return (
    <section className="help-section" aria-labelledby="help-title">
      <header className="help-head">
        <p className="help-eyebrow">{t.eyebrow}</p>
        <h2 id="help-title">
          {t.before}{" "}
          <span className="help-circled">
            {t.circled}
            {/* hand-drawn loop around the words */}
            <svg viewBox="0 0 200 64" preserveAspectRatio="none" aria-hidden>
              <path d="M12 38C8 18 70 6 118 7s80 8 78 26-60 27-112 26S4 52 10 34c3-9 22-17 52-21" />
            </svg>
          </span>
        </h2>
        <p>{t.intro}</p>
      </header>

      <ul className="help-grid">
        {t.offers.map((offer, index) => (
          <li key={offer.key}>
            <ContactTrigger className={`help-card${index === 0 ? " help-card-featured" : ""}`} href={t.contact} interest={INTEREST_BY_ICON[offer.key]}>
              <span className="help-icon">{ICONS[offer.key]}</span>
              {offer.tag && <span className="help-tag">{offer.tag}</span>}
              <h3>{offer.title}</h3>
              <p>{offer.text}</p>
              <span className="help-cta">
                {offer.cta} <span aria-hidden>→</span>
              </span>
            </ContactTrigger>
          </li>
        ))}
      </ul>
    </section>
  );
}

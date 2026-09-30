import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { PROFILE } from "../data";

const COPY: Record<"pt" | "en", {
  eyebrow: string;
  paragraphs: ReactNode[];
  cta: { label: string; href: string };
  badges: { title: string; text: string }[];
  alt: string;
}> = {
  pt: {
    eyebrow: "Sobre",
    paragraphs: [
      <>
        Engenheiro de software formado em <strong>Análise e Desenvolvimento de Sistemas pela Unisinos</strong>. Hoje sou{" "}
        <strong>CTO e sócio da Polvor Tecnologia e Software</strong>, software house que desenvolve sites, apps e sistemas sob medida, e{" "}
        <strong>cofundador do Gestor de Agências</strong>, SaaS de gestão para agências.
      </>,
      <>
        Comecei a programar por volta dos 14 anos e segui para o desenvolvimento web. Transformei a atuação como freelancer em empresa e já são{" "}
        <strong>mais de 100 projetos entregues</strong>, para clientes como Metal Work, Altus, Pause e Tris, no Brasil e no exterior.
      </>,
      <>
        Trabalho em <strong>português, inglês e espanhol</strong> e escrevo sobre engenharia, produto e as decisões que fazem o trabalho permanecer.
      </>,
    ],
    cta: { label: "Ler biografia completa", href: "/sobre" },
    badges: [
      { title: "CTO e sócio", text: "Polvor Tecnologia e Software" },
      { title: "+100 projetos", text: "entregues para empresas" },
    ],
    alt: "Lucas Ritter Dias de perfil, em um estádio",
  },
  en: {
    eyebrow: "About",
    paragraphs: [
      <>
        Software engineer with a degree in <strong>Systems Analysis and Development from Unisinos</strong>. Today I am{" "}
        <strong>CTO and partner at Polvor Tecnologia e Software</strong>, a software house building custom websites, apps and systems, and{" "}
        <strong>co-founder of Gestor de Agências</strong>, a management SaaS for agencies.
      </>,
      <>
        I started programming at around 14 and moved into web development. I turned freelance work into a company, with{" "}
        <strong>more than 100 projects delivered</strong> for clients such as Metal Work, Altus, Pause and Tris, in Brazil and abroad.
      </>,
      <>
        I work in <strong>Portuguese, English and Spanish</strong> and write about engineering, product and the decisions that make work last.
      </>,
    ],
    cta: { label: "Read full biography", href: "/en/about" },
    badges: [
      { title: "CTO and partner", text: "Polvor Tecnologia e Software" },
      { title: "100+ projects", text: "delivered for companies" },
    ],
    alt: "Lucas Ritter Dias in profile, at a stadium",
  },
};

export function AboutSection({ locale }: { locale: "pt" | "en" }) {
  const t = COPY[locale];

  return (
    <section className="about-section" aria-labelledby="about-title">
      <div className="about-text">
        <p className="about-eyebrow">{t.eyebrow}</p>
        <h2 id="about-title">{PROFILE.name}</h2>
        {t.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        <Link className="about-cta" href={t.cta.href}>
          {t.cta.label} <span aria-hidden>→</span>
        </Link>
      </div>

      <figure className="about-photo">
        <Image
          src="/library/d1df5739-db46-4718-9f43-20c9053f61e5.jpeg"
          alt={t.alt}
          width={1066}
          height={1600}
          sizes="(max-width: 860px) 90vw, 26rem"
        />
        {t.badges.map((badge, index) => (
          <div key={badge.title} className={`about-badge about-badge-${index + 1}`}>
            <strong>{badge.title}</strong>
            <span>{badge.text}</span>
          </div>
        ))}
      </figure>
    </section>
  );
}

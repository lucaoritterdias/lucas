import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { PROFILE } from "../data";
import { Breadcrumb } from "./Breadcrumb";

type Copy = {
  crumb: string;
  lead: ReactNode;
  sections: { title: string; body: ReactNode[] }[];
  facts: { label: string; value: ReactNode }[];
  alt: string;
};

const COPY: Record<"pt" | "en", Copy> = {
  pt: {
    crumb: "Sobre",
    lead: (
      <>
        <strong>Lucas Ritter Dias</strong> é engenheiro de software e empreendedor brasileiro. É <strong>CTO e sócio da Polvor Tecnologia e Software</strong>,
        software house que desenvolve sites, aplicativos e sistemas sob medida, e <strong>cofundador do Gestor de Agências</strong>, plataforma de gestão para agências.
      </>
    ),
    sections: [
      {
        title: "Formação",
        body: [
          <>
            Começou a programar por volta dos 14 anos e seguiu para o desenvolvimento web. É formado em{" "}
            <strong>Análise e Desenvolvimento de Sistemas pela Unisinos</strong>, em São Leopoldo, no Rio Grande do Sul.
          </>,
        ],
      },
      {
        title: "Carreira",
        body: [
          <>
            Iniciou a carreira como freelancer, atendendo empresas de diferentes segmentos e tamanhos. Com o aumento da demanda, estruturou os projetos avulsos em
            empresa: primeiro a R&amp;D Sistemas e, a partir da evolução dela, a <strong>Polvor Tecnologia e Software</strong>, criada para ampliar a capacidade de
            entrega e atender empresas com maior escala e complexidade.
          </>,
          <>
            Ao longo de mais de 7 anos de atuação, acumula <strong>mais de 100 projetos entregues</strong>, para clientes como Metal Work, Altus, Brazil Design, Pause,
            Tris, Artools, Orgânica Digital e Jobcontent, no Brasil e no exterior.
          </>,
        ],
      },
      {
        title: "Polvor e Gestor de Agências",
        body: [
          <>
            Na Polvor, lidera a área técnica: arquitetura de sistemas, infraestrutura, padrões de código e processo de entrega. Define a stack e os ambientes de
            deploy, desenha as soluções junto aos clientes e conduz o time de desenvolvimento.
          </>,
          <>
            O <strong>Gestor de Agências</strong> nasceu dentro da Polvor, em parceria com a agência Jobcontent, a partir da rotina real de agências que operam entre
            planilhas e ferramentas desconectadas. Reúne clientes, projetos, entregas e financeiro no mesmo lugar.
          </>,
        ],
      },
      {
        title: "Escrita",
        body: [
          <>
            Escreve sobre engenharia de software, produto, negócios e as decisões que fazem o trabalho permanecer. Os textos estão reunidos em{" "}
            <Link href="/artigos">Artigos</Link>.
          </>,
        ],
      },
    ],
    facts: [
      { label: "Nome completo", value: "Lucas Ritter Dias" },
      { label: "Ocupação", value: "Engenheiro de software, CTO e empreendedor" },
      { label: "Empresa", value: <>Polvor Tecnologia e Software (CTO e sócio)</> },
      { label: "Também", value: <>Gestor de Agências (cofundador)</> },
      { label: "Formação", value: "Análise e Desenvolvimento de Sistemas, Unisinos" },
      { label: "Idiomas", value: "Português, inglês e espanhol" },
      { label: "Contato", value: <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a> },
      { label: "LinkedIn", value: <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">{PROFILE.linkedinUser}</a> },
    ],
    alt: "Retrato de Lucas Ritter Dias",
  },
  en: {
    crumb: "About",
    lead: (
      <>
        <strong>Lucas Ritter Dias</strong> is a Brazilian software engineer and entrepreneur. He is <strong>CTO and partner at Polvor Tecnologia e Software</strong>,
        a software house building custom websites, apps and systems, and <strong>co-founder of Gestor de Agências</strong>, a management platform for agencies.
      </>
    ),
    sections: [
      {
        title: "Education",
        body: [
          <>
            He started programming at around 14 and moved into web development. He holds a degree in{" "}
            <strong>Systems Analysis and Development from Unisinos</strong>, in São Leopoldo, Rio Grande do Sul.
          </>,
        ],
      },
      {
        title: "Career",
        body: [
          <>
            He started out as a freelancer, serving companies of different sectors and sizes. As demand grew, he turned one-off projects into a company: first
            R&amp;D Sistemas and then, growing out of it, <strong>Polvor Tecnologia e Software</strong>, created to expand delivery capacity and serve companies with
            greater scale and complexity.
          </>,
          <>
            Over more than 7 years, he has <strong>delivered over 100 projects</strong> for clients such as Metal Work, Altus, Brazil Design, Pause, Tris, Artools,
            Orgânica Digital and Jobcontent, in Brazil and abroad.
          </>,
        ],
      },
      {
        title: "Polvor and Gestor de Agências",
        body: [
          <>
            At Polvor he leads engineering: systems architecture, infrastructure, code standards and the delivery process. He defines the stack and deployment
            environments, designs solutions with clients and runs the development team.
          </>,
          <>
            <strong>Gestor de Agências</strong> was born inside Polvor, in partnership with the Jobcontent agency, from the real routine of agencies working across
            spreadsheets and disconnected tools. It brings clients, projects, deliverables and finances together.
          </>,
        ],
      },
      {
        title: "Writing",
        body: [
          <>
            He writes about software engineering, product, business and the decisions that make work last. The pieces are collected in{" "}
            <Link href="/en/articles">Articles</Link>.
          </>,
        ],
      },
    ],
    facts: [
      { label: "Full name", value: "Lucas Ritter Dias" },
      { label: "Occupation", value: "Software engineer, CTO and entrepreneur" },
      { label: "Company", value: <>Polvor Tecnologia e Software (CTO and partner)</> },
      { label: "Also", value: <>Gestor de Agências (co-founder)</> },
      { label: "Education", value: "Systems Analysis and Development, Unisinos" },
      { label: "Languages", value: "Portuguese, English and Spanish" },
      { label: "Contact", value: <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a> },
      { label: "LinkedIn", value: <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">{PROFILE.linkedinUser}</a> },
    ],
    alt: "Portrait of Lucas Ritter Dias",
  },
};

export function BioPage({ locale }: { locale: "pt" | "en" }) {
  const t = COPY[locale];

  return (
    <main className="bio-page">
      <Breadcrumb locale={locale} items={[{ label: t.crumb }]} />

      <div className="bio-layout">
        <article className="bio-text">
          <h1>{PROFILE.name}</h1>
          <p className="bio-lead">{t.lead}</p>
          {t.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </section>
          ))}
        </article>

        <aside className="bio-aside">
          <Image
            className="bio-photo"
            src="/library/lucas-perfil.jpeg"
            alt={t.alt}
            width={960}
            height={1280}
            sizes="(max-width: 860px) 90vw, 20rem"
            priority
          />
          <dl className="bio-facts">
            {t.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </main>
  );
}

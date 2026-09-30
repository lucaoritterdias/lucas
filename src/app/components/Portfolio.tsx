import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { PORTFOLIO, type Client, type PortfolioProject } from "../data";
import { Breadcrumb } from "./Breadcrumb";
import { ContactTrigger } from "./ContactDialog";

const COPY = {
  pt: {
    crumb: "Portfólio",
    title: "Negócios e projetos",
    intro: "Empresas e produtos que ajudei a construir, com o que fiz em cada um.",
    active: "Em andamento",
    done: "Concluídos",
    view: "Ver projeto",
    about: "Sobre",
    work: "Minha atuação",
    role: "Papel",
    status: "Status",
    statusLabel: { active: "Em andamento", done: "Concluído" },
    site: "Site",
    stack: "Stack",
    visit: "Visitar site",
    wantProject: "Quero um projeto assim",
    contact: "/contato",
    next: "Próximo projeto",
    clients: (name: string) => `Pela ${name.split(" ")[0]} já atendemos grandes empresas`,
    clientsMore: "E muitas outras.",
    base: "/portfolio",
  },
  en: {
    crumb: "Portfolio",
    title: "Businesses and projects",
    intro: "Companies and products I have helped build, and what I did in each of them.",
    active: "In progress",
    done: "Completed",
    view: "View project",
    about: "About",
    work: "My role",
    role: "Role",
    status: "Status",
    statusLabel: { active: "In progress", done: "Completed" },
    site: "Website",
    stack: "Stack",
    visit: "Visit website",
    wantProject: "I want a project like this",
    contact: "/en/contact",
    next: "Next project",
    clients: (name: string) => `Through ${name.split(" ")[0]} we have served major companies`,
    clientsMore: "And many more.",
    base: "/en/portfolio",
  },
} as const;

type Locale = keyof typeof COPY;

/** Screenshot when there is one, otherwise a cover drawn from the project's name and brand color. */
function ProjectCover({ project, large = false }: { project: PortfolioProject; large?: boolean }) {
  if (project.image) {
    return (
      <div className="project-cover">
        <Image src={project.image} alt="" fill sizes={large ? "(max-width: 72rem) 100vw, 72rem" : "(max-width: 760px) 100vw, 36rem"} priority={large} />
      </div>
    );
  }
  return (
    <div className="project-cover project-cover-generated" style={{ "--project-accent": project.accent } as CSSProperties} aria-hidden>
      <span className="project-cover-name">{project.name}</span>
      <span className="project-cover-domain">{project.domain}</span>
    </div>
  );
}

/** Endless logo strip: the list is rendered twice and the track slides by half its width. */
function ClientMarquee({ clients }: { clients: Client[] }) {
  const logos = (hidden: boolean) =>
    clients.map((client) => (
      <li key={client.name} className={`client-tile client-tile-${client.tone}`} aria-hidden={hidden || undefined}>
        <a href={client.href} target="_blank" rel="noreferrer" tabIndex={hidden ? -1 : undefined} title={client.name}>
          <Image src={client.logo} alt={client.name} width={client.width} height={client.height} unoptimized />
        </a>
      </li>
    ));

  return (
    <div className="client-marquee">
      <ul className="client-track">
        {logos(false)}
        {logos(true)}
      </ul>
    </div>
  );
}

export function PortfolioIndex({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const groups = (["active", "done"] as const)
    .map((status) => ({ status, projects: PORTFOLIO.filter((project) => project.status === status) }))
    .filter((group) => group.projects.length);

  return (
    <main className="portfolio-page">
      <Breadcrumb locale={locale} items={[{ label: t.crumb }]} />
      <header className="portfolio-head">
        <h1>{t.title}</h1>
        <p className="portfolio-lead">{t.intro}</p>
      </header>

      {groups.map(({ status, projects }) => (
        <section key={status} className="portfolio-group" aria-labelledby={`portfolio-${status}`}>
          <h2 id={`portfolio-${status}`} className="portfolio-eyebrow">{t[status]}</h2>
          <ul className="portfolio-grid">
            {projects.map((project) => (
              <li key={project.slug}>
                <Link className="portfolio-card" href={`${t.base}/${project.slug}`}>
                  <ProjectCover project={project} />
                  <div className="portfolio-card-body">
                    <h3>{project.name}</h3>
                    <p>{project.summary[locale]}</p>
                    <span className="portfolio-role">{project.role[locale]}</span>
                    <span className="portfolio-more">{t.view} <span aria-hidden>→</span></span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

export function PortfolioProjectView({ project, locale }: { project: PortfolioProject; locale: Locale }) {
  const t = COPY[locale];
  const index = PORTFOLIO.indexOf(project);
  const next = PORTFOLIO.length > 1 ? PORTFOLIO[(index + 1) % PORTFOLIO.length] : undefined;

  return (
    <main className="portfolio-page portfolio-detail">
      <Breadcrumb locale={locale} items={[{ label: t.crumb, href: t.base }, { label: project.name }]} />

      <header className="portfolio-head">
        <h1>{project.name}</h1>
        <p className="portfolio-lead">{project.lead[locale]}</p>
      </header>

      <ProjectCover project={project} large />

      <div className="portfolio-body">
        <div className="portfolio-content">
          <section>
            <h2>{t.about}</h2>
            {project.about[locale].map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
          <section>
            <h2>{t.work}</h2>
            <ul>
              {project.points[locale].map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="portfolio-facts">
          <dl>
            <div>
              <dt>{t.role}</dt>
              <dd>{project.role[locale]}</dd>
            </div>
            <div>
              <dt>{t.status}</dt>
              <dd>{t.statusLabel[project.status]}</dd>
            </div>
            <div>
              <dt>{t.site}</dt>
              <dd>
                <a href={project.href} target="_blank" rel="noreferrer">{project.domain}</a>
              </dd>
            </div>
            <div>
              <dt>{t.stack}</dt>
              <dd className="portfolio-stack">
                {project.stack.map((chip) => (
                  <span key={chip.label}>
                    <i style={{ background: chip.dot }} aria-hidden />
                    {chip.label}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <a className="portfolio-visit" href={project.href} target="_blank" rel="noreferrer">
            {t.visit} <span aria-hidden>↗</span>
          </a>
          <ContactTrigger className="portfolio-cta" href={t.contact} interest="project">
            {t.wantProject} <span aria-hidden>→</span>
          </ContactTrigger>
        </aside>
      </div>

      {project.clients?.length ? (
        <section className="portfolio-clients" aria-labelledby="portfolio-clients-title">
          <h2 id="portfolio-clients-title">{t.clients(project.name)}</h2>
          <ClientMarquee clients={project.clients} />
          <p>{t.clientsMore}</p>
        </section>
      ) : null}

      {next && next !== project && (
        <nav className="portfolio-next" aria-label={t.next}>
          <span>{t.next}</span>
          <Link href={`${t.base}/${next.slug}`}>
            {next.name} <span aria-hidden>→</span>
          </Link>
        </nav>
      )}
    </main>
  );
}

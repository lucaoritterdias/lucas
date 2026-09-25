const COPY = {
  pt: {
    title: "Projetos",
    current: "Onde estou colocando forças agora",
  },
  en: {
    title: "Projects",
    current: "Where I am focusing my energy now",
  },
} as const;

const PROJECTS = [
  {
    name: "Polvor Tecnologia e Software",
    domain: "www.polvor.com",
    href: "https://www.polvor.com",
    description:
      "Software House onde sou CTO. Desenvolvemos sites, apps, sistemas e soluções de software sob medida para empresas.",
  },
  {
    name: "GA. Gestor de Agências",
    domain: "www.gestordeagencias.com",
    href: "https://www.gestordeagencias.com",
    description:
      "SaaS em construção, produto nascido dentro da Polvor Tecnologia e Software com a agência Job Content.",
  },
] as const;

export function ProjectsView({ locale }: { locale: keyof typeof COPY }) {
  const t = COPY[locale];

  return (
    <main className="home projects-page">
      <header className="home-intro">
        <h1>{t.title}</h1>
      </header>

      <section className="project-topics" aria-label={t.title}>
        <h2>{t.current}</h2>
        <ul className="project-list">
          {PROJECTS.map((project) => (
            <li key={project.href}>
              <a href={project.href} target="_blank" rel="noreferrer">
                <span>{project.name}</span>
                <small>{project.domain}</small>
              </a>
              <p>{project.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ARTICLES, EN_ARTICLES } from "../articles";
import { PROJECTS } from "../data";
import portrait from "../portrait.jpg";

const COPY = {
  pt: {
    eyebrow: "Perfil",
    statement:
      "Lucas Ritter Dias é empreendedor e engenheiro de software brasileiro, CTO e sócio da Polvor e cofundador do Gestor de Agências.",
    portraitAlt: "Retrato em preto e branco de Lucas Ritter Dias",
    aboutIndex: "01 / Sobre",
    aboutTitle: "Engenharia, produto & negócio.",
    about: [
      "Lucas começou a programar por volta dos 14 anos e seguiu para o desenvolvimento web. Desde então, são mais de 100 projetos entregues para empresas de diferentes segmentos e tamanhos.",
      "É formado em Análise e Desenvolvimento de Sistemas pela Unisinos, de São Leopoldo.",
      "Hoje, atua como CTO e empreendedor serial, buscando resolver problemas reais através da tecnologia.",
    ],
    workIndex: "02 / Projetos",
    workTitle: ["Projetos", "ativos."],
    projects: [
      { kicker: "01 / Empresa", name: "Polvor", description: "Software house que desenvolve produtos digitais e sistemas sob medida para empresas com escala e complexidade." },
      { kicker: "02 / Produto", name: "Gestor de Agências", description: "Plataforma de gestão para agências: clientes, projetos, entregas e financeiro no mesmo lugar." },
    ],
    articlesIndex: "03 / Artigos",
    articlesTitle: ["Notas de quem", "constrói."],
    articlesLink: "Todos os artigos →",
    articlesHref: "/artigos",
  },
  en: {
    eyebrow: "Profile",
    statement:
      "Lucas Ritter Dias is a Brazilian entrepreneur and software engineer, CTO and partner at Polvor, and co-founder of Agency Manager.",
    portraitAlt: "Black-and-white portrait of Lucas Ritter Dias",
    aboutIndex: "01 / About",
    aboutTitle: "Engineering, product & business.",
    about: [
      "Lucas started programming around age 14 and moved into web development. Since then, he has delivered more than 100 projects for companies of different industries and sizes.",
      "He holds a degree in Systems Analysis and Development from Unisinos, in São Leopoldo.",
      "Today, he works as a CTO and serial entrepreneur, looking to solve real problems through technology.",
    ],
    workIndex: "02 / Projects",
    workTitle: ["Active", "projects."],
    projects: [
      { kicker: "01 / Company", name: "Polvor", description: "A software company building digital products and custom systems for businesses at scale." },
      { kicker: "02 / Product", name: "Agency Manager", description: "A management platform for agencies: clients, projects, delivery, and finance in one place." },
    ],
    articlesIndex: "03 / Articles",
    articlesTitle: ["Notes from", "the build."],
    articlesLink: "All articles →",
    articlesHref: "/en/articles",
  },
};

export function HomePage({ locale = "pt" }: { locale?: "pt" | "en" }) {
  const t = COPY[locale];
  const en = locale === "en";
  const articles = (en ? EN_ARTICLES : ARTICLES).slice(0, 3);
  const articleBase = en ? "/en/articles" : "/artigos";

  return (
    <main>
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">
            {t.eyebrow} / {new Date().getFullYear()}
          </p>
          <h1 id="page-title">
            <span>Lucas</span> <span>Ritter</span> <span>Dias</span>
          </h1>
          <p className="hero-statement">{t.statement}</p>
        </div>

        <figure className="portrait">
          <Image
            src={portrait}
            alt={t.portraitAlt}
            priority
            placeholder="blur"
            sizes="(max-width: 720px) 100vw, 44vw"
          />
        </figure>
      </section>

      <section className="section" aria-labelledby="about-title">
        <div className="section-side">
          <p className="section-index">{t.aboutIndex}</p>
        </div>
        <div className="section-body">
          <h2 id="about-title">{t.aboutTitle}</h2>
          <div className="about-copy">
            <p>{t.about[0]}</p>
            <div>
              {t.about.slice(1).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-rows" aria-labelledby="work-title">
        <div className="section-side">
          <p className="section-index">{t.workIndex}</p>
        </div>
        <div className="section-body">
          <h2 id="work-title">
            {t.workTitle[0]}
            <br />
            {t.workTitle[1]}
          </h2>
          <ul className="rows">
            {PROJECTS.map((project, index) => (
              <li key={project.slug}>
                <a className="row-link" href={project.href} target="_blank" rel="noreferrer">
                  <span className="row-kicker">{t.projects[index].kicker}</span>
                  <span className="row-name">{t.projects[index].name}</span>
                  <span className="row-description">{t.projects[index].description}</span>
                  <span className="arrow" aria-hidden>→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-rows" aria-labelledby="articles-title">
        <div className="section-side">
          <p className="section-index">{t.articlesIndex}</p>
          <Link className="side-link" href={t.articlesHref}>
            {t.articlesLink}
          </Link>
        </div>
        <div className="section-body">
          <h2 id="articles-title">
            {t.articlesTitle[0]}
            <br />
            {t.articlesTitle[1]}
          </h2>
          <ul className="rows rows-articles">
            {articles.map((article) => (
              <li key={article.slug}>
                <Link className="row-link" href={`${articleBase}/${article.slug}`}>
                  <span className="row-kicker">
                    {article.date}
                    <br />
                    {article.category} · {article.time}
                  </span>
                  <span className="row-name">{article.title}</span>
                  <span className="row-description">{article.excerpt}</span>
                  <span className="arrow" aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

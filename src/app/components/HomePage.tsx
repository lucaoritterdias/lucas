import Image from "next/image";
import Link from "next/link";
import { ARTICLES, EN_ARTICLES } from "../articles";
import avatar from "../avatar.png";

const COPY = {
  pt: {
    statement:
      "Lucas Ritter Dias é empreendedor e engenheiro de software brasileiro, CTO e sócio da Polvor e cofundador do Gestor de Agências.",
    articles: "Artigos",
  },
  en: {
    statement:
      "Lucas Ritter Dias is a Brazilian entrepreneur and software engineer, CTO and partner at Polvor, and co-founder of Agency Manager.",
    articles: "Articles",
  },
};

export function HomePage({ locale = "pt" }: { locale?: "pt" | "en" }) {
  const t = COPY[locale];
  const en = locale === "en";
  const articles = en ? EN_ARTICLES : ARTICLES;
  const articleBase = en ? "/en/articles" : "/artigos";

  return (
    <main className="home">
      <section className="home-intro" aria-labelledby="page-title">
        <div className="home-identity">
          <Image
            className="home-avatar"
            src={avatar}
            alt=""
            priority
            sizes="(max-width: 720px) 64px, 96px"
          />
          <h1 id="page-title">Lucas Ritter Dias</h1>
        </div>
        <p>{t.statement}</p>
      </section>

      <section className="home-articles article-list" aria-label={t.articles}>
        <ul>
          {articles.map((article) => (
            <li key={article.slug}>
              <Link href={`${articleBase}/${article.slug}`}>
                {article.title}
              </Link>
              <div className="article-tags" aria-label={en ? "Tags" : "Etiquetas"}>
                {article.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

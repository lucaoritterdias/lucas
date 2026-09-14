import Image from "next/image";
import Link from "next/link";
import type { Article } from "../articles";
import avatar from "../avatar.png";
import { commentsEnabled } from "../comments";
import { SITE_URL } from "../data";
import { ArticleShare } from "./ArticleShare";
import { ArticleToc } from "./ArticleToc";
import { Comments } from "./Comments";

const COPY = {
  pt: {
    index: "Artigos",
    title: "Notas pessoais.",
    lead: "Escrevo quando algo merece ser registrado. Sobre software, tecnologia e IA.",
    base: "/artigos",
    back: "← Artigos",
    category: "Tema",
    date: "Publicado",
    time: "Leitura",
    comments: "Comentários",
    commentsNote: "Comente com sua conta do GitHub.",
    bio: "Empreendedor e engenheiro de software. CTO e sócio da Polvor e cofundador do Gestor de Agências.",
    home: "/",
    toc: "Sumário",
    role: "CTO e sócio da Polvor",
  },
  en: {
    index: "Articles",
    title: "Personal notes.",
    lead: "I write when something feels worth writing down. On software, technology, and AI.",
    base: "/en/articles",
    back: "← Articles",
    category: "Topic",
    date: "Published",
    time: "Reading",
    comments: "Comments",
    commentsNote: "Comment with your GitHub account.",
    bio: "Entrepreneur and software engineer. CTO and partner at Polvor, co-founder of Agency Manager.",
    home: "/en",
    toc: "Contents",
    role: "CTO and partner at Polvor",
  },
};

type Locale = keyof typeof COPY;

function ArticleRows({ articles, base }: { articles: Article[]; base: string }) {
  return (
    <ul className="rows rows-articles">
      {articles.map((article) => (
        <li key={article.slug}>
          <Link className="row-link" href={`${base}/${article.slug}`}>
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
  );
}

export function ArticleIndex({ articles, locale }: { articles: Article[]; locale: Locale }) {
  const t = COPY[locale];
  return (
    <main>
      <header className="page-head">
        <p className="eyebrow">
          {t.index} / {String(articles.length).padStart(2, "0")}
        </p>
        <h1 className="page-title">{t.title}</h1>
        <p className="page-lead">{t.lead}</p>
      </header>
      <section className="page-rows">
        <ArticleRows articles={articles} base={t.base} />
      </section>
    </main>
  );
}

export function ArticleView({ article, locale }: { article: Article; locale: Locale }) {
  const t = COPY[locale];

  return (
    <main>
      <article className="article">
        <aside className="article-side">
          <Link className="side-link" href={t.base}>
            {t.back}
          </Link>
          <div className="author-card">
            <Image className="author-avatar" src={avatar} alt="" width={56} height={56} />
            <div>
              <Link className="author-name" href={t.home} rel="author">
                Lucas Ritter Dias
              </Link>
              <p className="author-bio">{t.bio}</p>
            </div>
          </div>
          <dl className="article-meta">
            <div>
              <dt>{t.category}</dt>
              <dd>{article.category}</dd>
            </div>
            <div>
              <dt>{t.date}</dt>
              <dd>{article.date}</dd>
            </div>
            <div>
              <dt>{t.time}</dt>
              <dd>{article.time}</dd>
            </div>
          </dl>
          <ArticleShare title={article.title} url={`${SITE_URL}${t.base}/${article.slug}`} locale={locale} />
          <ArticleToc items={article.sections.map(({ id, title }) => ({ id, title }))} label={t.toc} />
        </aside>

        <div className="article-main">
          <header className="article-head">
            <h1 className="article-title">{article.title}</h1>
            <p className="article-lead">{article.excerpt}</p>
          </header>

          <div className="prose">
            {article.sections.map(({ id, title, html }) => (
              <section key={id} id={id}>
                <h2>{title}</h2>
                <div dangerouslySetInnerHTML={{ __html: html }} />
              </section>
            ))}
          </div>

          <footer className="article-signature">
            <span>Lucas Ritter Dias</span>
            <span>{t.role}</span>
          </footer>
        </div>
      </article>

      {commentsEnabled && (
        <section className="section" id="comentarios" aria-labelledby="comments-title">
          <div className="section-side">
            <p className="section-index" id="comments-title">
              {t.comments}
            </p>
            <p className="side-note">{t.commentsNote}</p>
          </div>
          <div className="section-body">
            <Comments term={article.slug} locale={locale} />
          </div>
        </section>
      )}
    </main>
  );
}

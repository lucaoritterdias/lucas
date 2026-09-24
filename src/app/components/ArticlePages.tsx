import Link from "next/link";
import type { Article } from "../articles";
import { commentsEnabled } from "../comments";
import { Comments } from "./Comments";

const COPY = {
  pt: {
    index: "Artigos",
    base: "/artigos",
    comments: "Discussão",
    commentsNote: "Comente com sua conta do GitHub.",
  },
  en: {
    index: "Articles",
    base: "/en/articles",
    comments: "Discussion",
    commentsNote: "Comment with your GitHub account.",
  },
};

type Locale = keyof typeof COPY;

function ArticleRows({ articles, base, locale }: { articles: Article[]; base: string; locale: Locale }) {
  return (
    <ul>
      {articles.map((article) => (
        <li key={article.slug}>
          <Link href={`${base}/${article.slug}`}>{article.title}</Link>
          <div className="article-tags" aria-label={locale === "en" ? "Tags" : "Etiquetas"}>
            {article.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ArticleIndex({ articles, locale }: { articles: Article[]; locale: Locale }) {
  const t = COPY[locale];
  return (
    <main className="home article-index">
      <header className="home-intro">
        <h1>{t.index}</h1>
      </header>
      <section className="home-articles article-list" aria-label={t.index}>
        <ArticleRows articles={articles} base={t.base} locale={locale} />
      </section>
    </main>
  );
}

export function ArticleView({ article, locale }: { article: Article; locale: Locale }) {
  const t = COPY[locale];

  return (
    <main className="article-page">
      <article className="article">
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
        </div>
      </article>

      {commentsEnabled && (
        <section className="article-comments" aria-labelledby="comments-title">
          <header>
            <h2 id="comments-title">{t.comments}</h2>
            <p>{t.commentsNote}</p>
          </header>
          <Comments term={article.slug} locale={locale} />
        </section>
      )}
    </main>
  );
}

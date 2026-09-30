import type { Article } from "../articles";
import { commentsEnabled } from "../comments";
import { ArticleList } from "./ArticleList";
import { Comments } from "./Comments";

const COPY = {
  pt: {
    index: "Artigos",
    introduction: "Notas sobre engenharia de software, produto, negócios e as decisões que fazem o trabalho permanecer.",
    base: "/artigos",
    comments: "Discussão",
    commentsNote: "Comente com sua conta do GitHub.",
  },
  en: {
    index: "Articles",
    introduction: "Notes on software engineering, products, business, and the decisions that make work last.",
    base: "/en/articles",
    comments: "Discussion",
    commentsNote: "Comment with your GitHub account.",
  },
};

type Locale = keyof typeof COPY;

export function ArticleIndex({ articles, locale, selectedCategory }: { articles: Article[]; locale: Locale; selectedCategory?: string }) {
  const t = COPY[locale];
  return (
    <main className="home article-index">
      <header className="home-intro">
        <h1>{t.index}</h1>
        <p>{t.introduction}</p>
        <span className="article-index-count">{articles.length} {locale === "en" ? (articles.length === 1 ? "published article" : "published articles") : (articles.length === 1 ? "artigo publicado" : "artigos publicados")}</span>
      </header>
      <section className="home-articles article-list" aria-label={t.index}>
        <ArticleList articles={articles} base={t.base} locale={locale} selectedCategory={selectedCategory} filters />
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
            <div className="article-view-meta">
              <span>{article.date}</span>
              <span>{article.time}</span>
            </div>
            <div className="article-tags article-view-tags" aria-label={locale === "en" ? "Tags" : "Etiquetas"}>
              {article.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
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

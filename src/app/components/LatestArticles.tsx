import Link from "next/link";
import { ARTICLES, EN_ARTICLES } from "../articles";

const COPY = {
  pt: {
    eyebrow: "Escritos",
    title: "Últimos artigos",
    base: "/artigos",
    more: "Ver mais",
    moreText: (count: number) => `Todos os ${count} artigos publicados`,
    open: "Abrir artigos",
  },
  en: {
    eyebrow: "Writing",
    title: "Latest articles",
    base: "/en/articles",
    more: "See more",
    moreText: (count: number) => `All ${count} published articles`,
    open: "Open articles",
  },
};

export function LatestArticles({ locale }: { locale: "pt" | "en" }) {
  const t = COPY[locale];
  const articles = locale === "en" ? EN_ARTICLES : ARTICLES;
  // already sorted newest first
  const latest = articles.slice(0, 3);

  return (
    <section className="latest-section" aria-labelledby="latest-title">
      <p className="latest-eyebrow">{t.eyebrow}</p>
      <h2 id="latest-title">{t.title}</h2>

      <ul className="latest-grid">
        {latest.map((article) => (
          <li key={article.slug}>
            <Link className="latest-card" href={`${t.base}/${article.slug}`}>
              {/* typographic cover from the article's signature word */}
              <span className="latest-cover" aria-hidden>
                <span className="latest-cover-number">Nº {article.number}</span>
                <span className="latest-cover-word">{article.word || article.category}</span>
              </span>
              <span className="latest-body">
                <span className="latest-meta">
                  {article.category} · {article.time}
                </span>
                <strong>{article.title}</strong>
                <time dateTime={article.isoDate}>{article.date}</time>
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link className="latest-card latest-more" href={t.base}>
            <span className="latest-more-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                <path d="M5 7h14M5 12h14M5 17h9" />
              </svg>
            </span>
            <strong>{t.more}</strong>
            <span>{t.moreText(articles.length)}</span>
            <span className="latest-more-link">
              {t.open} <span aria-hidden>→</span>
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}

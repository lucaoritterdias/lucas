import Link from "next/link";
import type { Article } from "../articles";
import { ArticleFilters, type ArticleFilterValues } from "./ArticleFilters";

type Locale = "pt" | "en";

const minutes = (article: Article) => parseInt(article.time, 10) || 0;

const LENGTHS: Record<string, (min: number) => boolean> = {
  short: (min) => min <= 5,
  medium: (min) => min > 5 && min <= 10,
  long: (min) => min > 10,
};

const FILTER_KEYS = ["q", "category", "tag", "period", "length", "sort"] as const;

/** Keeps only the known, non-empty string query params. */
export function readArticleFilters(params: Record<string, string | string[] | undefined>): ArticleFilterValues {
  const filters: ArticleFilterValues = {};
  for (const key of FILTER_KEYS) {
    const value = params[key];
    if (typeof value === "string" && value.trim()) filters[key] = value.trim();
  }
  return filters;
}

function normalize(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function filterArticles(articles: Article[], { q, category, tag, period, length, sort }: ArticleFilterValues) {
  const terms = q ? normalize(q).split(/\s+/).filter(Boolean) : [];
  const visible = articles.filter((article) => {
    if (category && article.category !== category) return false;
    if (tag && !article.tags.includes(tag)) return false;
    if (period && !article.isoDate.startsWith(period)) return false;
    if (length && LENGTHS[length] && !LENGTHS[length](minutes(article))) return false;
    if (terms.length) {
      const haystack = normalize([article.title, article.excerpt, article.category, ...article.tags].join(" "));
      if (!terms.every((term) => haystack.includes(term))) return false;
    }
    return true;
  });
  // articles arrive newest first
  if (sort === "oldest") visible.reverse();
  if (sort === "shortest") visible.sort((a, b) => minutes(a) - minutes(b));
  return visible;
}

function periodOptions(articles: Article[], locale: Locale) {
  const years = new Map<string, { value: string; label: string }[]>();
  for (const article of articles) {
    const [year] = article.isoDate.split("-");
    const value = article.isoDate.slice(0, 7);
    const months = years.get(year) ?? [];
    if (!months.some((month) => month.value === value)) {
      const label = new Date(`${value}-15T12:00:00Z`).toLocaleDateString(locale === "en" ? "en-US" : "pt-BR", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
      months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    years.set(year, months);
  }
  return [...years].map(([year, months]) => ({ year, months }));
}

export function ArticleList({
  articles,
  base,
  locale,
  filterValues,
}: {
  articles: Article[];
  base: string;
  locale: Locale;
  /** when given, renders the filter bar and applies it */
  filterValues?: ArticleFilterValues;
}) {
  const filters = filterValues !== undefined;
  const visible = filters ? filterArticles(articles, filterValues) : articles;

  return (
    <div className={filters ? "article-browser" : undefined}>
      {filters && (
        <ArticleFilters
          locale={locale}
          values={filterValues}
          categories={[...new Set(articles.map((article) => article.category))].sort()}
          tags={[...new Set(articles.flatMap((article) => article.tags))].sort()}
          periods={periodOptions(articles, locale)}
          shown={visible.length}
          total={articles.length}
        />
      )}

      {visible.length === 0 ? (
        <p>{locale === "en" ? "No articles found for this filter." : "Nenhum artigo encontrado para este filtro."}</p>
      ) : (
        <ul className="article-card-grid">
          {visible.map((article) => (
            <li key={article.slug} className={article.kind === "news" ? "news-card" : undefined}>
              <Link
                className={`latest-cover article-card-cover${article.kind === "news" ? " news-cover" : ""}`}
                href={`${base}/${article.slug}`}
                aria-label={article.title}
              >
                <span className="latest-cover-number">Nº {article.number}</span>
                <span className="latest-cover-word">{article.word || article.category}</span>
              </Link>
              <div className="article-card-body">
                <Link className="article-list-category" href={`${base}?category=${encodeURIComponent(article.category)}`}>
                  {article.category}
                </Link>
                <Link className="article-list-title" href={`${base}/${article.slug}`}>
                  {article.title}
                </Link>
                <p className="article-list-excerpt">{article.excerpt}</p>
                <div className="article-item-meta">
                  <span>{article.date}</span>
                  <span>{article.time}</span>
                </div>
                <div className="article-tags" aria-label={locale === "en" ? "Tags" : "Etiquetas"}>
                  {article.tags.map((tag) => (
                    <Link key={tag} href={`${base}?tag=${encodeURIComponent(tag)}`}>#{tag}</Link>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

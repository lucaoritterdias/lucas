import Link from "next/link";
import type { Article } from "../articles";

type Locale = "pt" | "en";

export function ArticleList({
  articles,
  base,
  locale,
  selectedCategory,
  filters = false,
}: {
  articles: Article[];
  base: string;
  locale: Locale;
  selectedCategory?: string;
  filters?: boolean;
}) {
  const categories = [...new Set(articles.map((article) => article.category))].sort();
  const visible = articles.filter((article) => !selectedCategory || article.category === selectedCategory);

  return (
    <div className={filters ? "article-browser" : undefined}>
      {filters && (
        <aside className="article-filters" aria-label={locale === "en" ? "Article filters" : "Filtros de artigos"}>
          <nav className="category-filters" aria-label={locale === "en" ? "Filter by type" : "Filtrar por tipo"}>
            <h2>{locale === "en" ? "Filtering" : "Filtragem"}</h2>
            <Link href={base} aria-current={!selectedCategory ? "page" : undefined}>
              {locale === "en" ? "All" : "Todos"}
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={`${base}?category=${encodeURIComponent(category)}`}
                aria-current={selectedCategory === category ? "page" : undefined}
              >
                {category}
              </Link>
            ))}
          </nav>
        </aside>
      )}

      {visible.length === 0 ? (
        <p>{locale === "en" ? "No articles found for this filter." : "Nenhum artigo encontrado para este filtro."}</p>
      ) : (
        <ul className="article-card-grid">
          {visible.map((article) => (
            <li key={article.slug}>
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
                {article.tags.map((tag) => <span key={tag}>#{tag}</span>)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

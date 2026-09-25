import Link from "next/link";
import type { Article } from "../articles";

type Locale = "pt" | "en";

function monthLabel(isoDate: string, locale: Locale) {
  const [year, month] = isoDate.split("-").map(Number);
  const name = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  return `${year} · ${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

export function ArticleList({
  articles,
  base,
  locale,
  selectedTag,
  filters = false,
}: {
  articles: Article[];
  base: string;
  locale: Locale;
  selectedTag?: string;
  filters?: boolean;
}) {
  const tags = [...new Set(articles.flatMap((article) => article.tags))].sort();
  const visible = selectedTag
    ? articles.filter((article) => article.tags.includes(selectedTag))
    : articles;
  const groups = visible.reduce<Map<string, Article[]>>((result, article) => {
    const month = article.isoDate.slice(0, 7);
    result.set(month, [...(result.get(month) ?? []), article]);
    return result;
  }, new Map());

  return (
    <>
      {filters && (
        <nav className="tag-filters" aria-label={locale === "en" ? "Filter by tag" : "Filtrar por tag"}>
          <Link href={base} aria-current={!selectedTag ? "page" : undefined}>
            {locale === "en" ? "All" : "Todos"}
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`${base}?tag=${encodeURIComponent(tag)}`}
              aria-current={selectedTag === tag ? "page" : undefined}
            >
              #{tag}
            </Link>
          ))}
        </nav>
      )}

      <div className="article-groups">
        {[...groups.entries()].map(([month, monthArticles]) => (
          <section className="article-month" key={month}>
            <h2>{monthLabel(monthArticles[0].isoDate, locale)}</h2>
            <ul>
              {monthArticles.map((article) => (
                <li key={article.slug}>
                  <Link className="article-list-title" href={`${base}/${article.slug}`}>
                    {article.title}
                  </Link>
                  <div className="article-item-meta">
                    <span>{article.date}</span>
                    <span>{article.time}</span>
                  </div>
                  <div className="article-tags" aria-label={locale === "en" ? "Tags" : "Etiquetas"}>
                    {article.tags.map((tag) => (
                      <Link key={tag} href={`${base}?tag=${encodeURIComponent(tag)}`}>
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

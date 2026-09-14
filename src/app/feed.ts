import "server-only";
import { ARTICLES, EN_ARTICLES } from "./articles";
import { SITE_URL as SITE } from "./data";

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function feedResponse(locale: "pt" | "en") {
  const en = locale === "en";
  const articles = en ? EN_ARTICLES : ARTICLES;
  const base = en ? `${SITE}/en/articles` : `${SITE}/artigos`;

  const items = articles
    .map((article) => {
      const url = `${base}/${article.slug}`;
      return `    <item>
      <title>${escape(article.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(`${article.isoDate}T12:00:00Z`).toUTCString()}</pubDate>
      <category>${escape(article.category)}</category>
      <description>${escape(article.excerpt)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${en ? "Articles" : "Artigos"} · Lucas Ritter Dias</title>
    <link>${base}</link>
    <atom:link href="${SITE}${en ? "/en" : ""}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${en ? "I write when something feels worth writing down. On software, technology, and AI." : "Escrevo quando algo merece ser registrado. Sobre software, tecnologia e IA."}</description>
    <language>${en ? "en" : "pt-BR"}</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}

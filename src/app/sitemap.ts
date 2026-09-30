import type { MetadataRoute } from "next";
import { ARTICLES, EN_ARTICLES } from "./articles";
import { PORTFOLIO, SITE_URL } from "./data";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { pt: "", en: "/en", priority: 1 },
    { pt: "/sobre", en: "/en/about", priority: 0.9 },
    { pt: "/artigos", en: "/en/articles", priority: 0.9 },
    { pt: "/portfolio", en: "/en/portfolio", priority: 0.8 },
    { pt: "/contato", en: "/en/contact", priority: 0.7 },
  ];

  const pages: MetadataRoute.Sitemap = staticRoutes.flatMap(({ pt, en, priority }) => [
    {
      url: `${SITE_URL}${pt}`,
      changeFrequency: "monthly",
      priority,
      alternates: { languages: { "pt-BR": `${SITE_URL}${pt}`, en: `${SITE_URL}${en}` } },
    },
    {
      url: `${SITE_URL}${en}`,
      changeFrequency: "monthly",
      priority,
      alternates: { languages: { "pt-BR": `${SITE_URL}${pt}`, en: `${SITE_URL}${en}` } },
    },
  ]);

  const articlePages: MetadataRoute.Sitemap = ARTICLES.flatMap((article) => {
    const translated = EN_ARTICLES.find((item) => item.slug === article.slug);
    const ptUrl = `${SITE_URL}/artigos/${article.slug}`;
    const enUrl = `${SITE_URL}/en/articles/${article.slug}`;
    const languages = translated ? { "pt-BR": ptUrl, en: enUrl } : { "pt-BR": ptUrl };
    const entries: MetadataRoute.Sitemap = [
      {
        url: ptUrl,
        lastModified: article.isoDate,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages },
      },
    ];

    if (translated) {
      entries.push({
        url: enUrl,
        lastModified: translated.isoDate,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages },
      });
    }
    return entries;
  });

  const portfolioPages: MetadataRoute.Sitemap = PORTFOLIO.flatMap(({ slug }) => {
    const languages = { "pt-BR": `${SITE_URL}/portfolio/${slug}`, en: `${SITE_URL}/en/portfolio/${slug}` };
    return Object.values(languages).map((url) => ({
      url,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: { languages },
    }));
  });

  return [...pages, ...articlePages, ...portfolioPages];
}

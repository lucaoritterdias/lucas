import type { MetadataRoute } from "next";
import { SITE_URL } from "./data";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { languages: { "pt-BR": SITE_URL, en: `${SITE_URL}/en` }, priority: 1 },
    { languages: { "pt-BR": `${SITE_URL}/biblioteca`, en: `${SITE_URL}/en/library` }, priority: 0.7 },
    { languages: { "pt-BR": `${SITE_URL}/setup`, en: `${SITE_URL}/en/setup` }, priority: 0.6 },
  ];
  return pages.flatMap(({ languages, priority }) =>
    Object.values(languages).map((url) => ({
      url,
      changeFrequency: "monthly" as const,
      priority,
      alternates: { languages },
    })),
  );
}

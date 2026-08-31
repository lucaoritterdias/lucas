import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type ArticleSection = { title: string; html: string };

export type Article = {
  slug: string;
  category: string;
  number: string;
  date: string;
  time: string;
  word: string;
  title: string;
  excerpt: string;
  sections: ArticleSection[];
};

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "articles");

const MONTHS_PT = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(iso: string, locale: "pt" | "en") {
  const [year, month, day] = iso.split("-").map(Number);
  return locale === "pt" ? `${day} ${MONTHS_PT[month - 1]} ${year}` : `${MONTHS_EN[month - 1]} ${day}, ${year}`;
}

function parseSections(markdown: string): ArticleSection[] {
  return markdown
    .split(/\n(?=##\s)/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [heading, ...rest] = part.split("\n");
      const title = heading.replace(/^##\s*/, "").trim();
      const html = marked.parse(rest.join("\n").trim(), { async: false });
      return { title, html };
    });
}

function loadArticles(locale: "pt" | "en"): Article[] {
  const dir = path.join(CONTENT_DIR, locale);
  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".md"));

  const parsed = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const rawDate = data.date as string | Date;
    return {
      slug: data.slug as string,
      category: data.category as string,
      isoDate: rawDate instanceof Date ? rawDate.toISOString().slice(0, 10) : rawDate,
      time: data.time as string,
      word: (data.word as string) ?? "",
      title: data.title as string,
      excerpt: data.excerpt as string,
      sections: parseSections(content),
    };
  });

  parsed.sort((a, b) => (a.isoDate < b.isoDate ? 1 : -1));

  return parsed.map(({ isoDate, ...article }, index) => ({
    ...article,
    number: String(index + 1).padStart(2, "0"),
    date: formatDate(isoDate, locale),
  }));
}

export const ARTICLES: Article[] = loadArticles("pt");
export const EN_ARTICLES: Article[] = loadArticles("en");

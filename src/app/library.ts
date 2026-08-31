import "server-only";
import fs from "node:fs";
import path from "node:path";

export type Book = {
  slug: string;
  title: string;
  author: string;
  cover?: string;
  readAt?: string;
  rating?: string;
  excerpt: string;
  content: string;
};

const directory = path.join(process.cwd(), "src/content/library");

function parseFile(filename: string): Book {
  const raw = fs.readFileSync(path.join(directory, filename), "utf8");
  const [, frontmatter = "", content = raw] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? [];
  const meta = Object.fromEntries(frontmatter.split("\n").filter(Boolean).map((line) => {
    const index = line.indexOf(":");
    return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "")];
  }));
  return {
    slug: filename.replace(/\.md$/, ""), title: meta.title || "Sem título", author: meta.author || "Autor desconhecido",
    cover: meta.cover || undefined, readAt: meta.readAt || undefined, rating: meta.rating || undefined,
    excerpt: meta.excerpt || content.split("\n").find((line) => line.trim() && !line.startsWith("#")) || "",
    content,
  };
}

export function getBooks() {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory).filter((file) => file.endsWith(".md") && !file.startsWith("_")).map(parseFile).sort((a, b) => (b.readAt || "").localeCompare(a.readAt || ""));
}

export function getBook(slug: string) { return getBooks().find((book) => book.slug === slug); }

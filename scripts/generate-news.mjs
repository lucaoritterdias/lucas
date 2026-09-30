import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const SOURCES_FILE = path.join(ROOT, "scripts", "news-sources.json");
const OUTPUT_DIR = path.join(ROOT, "src", "content", "articles", "pt");
const LIMIT = 6;
const LOOKBACK_HOURS = 36;

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, ...value] = argument.replace(/^--/, "").split("=");
    return [key, value.join("=") || true];
  }),
);

function saoPauloDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block, names) {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (match) return decodeXml(match[1]);
  }
  return "";
}

function itemLink(block) {
  const regular = tag(block, ["link"]);
  if (/^https?:\/\//.test(regular)) return regular;
  const atom = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1];
  return decodeXml(atom ?? "");
}

function parseFeed(xml, source) {
  const blocks = [
    ...(xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? []),
    ...(xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? []),
  ];

  return blocks.map((block) => ({
    source,
    title: tag(block, ["title"]),
    url: itemLink(block),
    summary: tag(block, ["description", "summary", "content:encoded", "content"]),
    publishedAt: new Date(tag(block, ["pubDate", "published", "updated", "dc:date"])),
  }));
}

function normalizeTitle(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function yamlString(value) {
  return JSON.stringify(value.replace(/\s+/g, " ").trim());
}

function markdownLinkText(value) {
  return value.replace(/([\\\[\]])/g, "\\$1");
}

function shortSummary(value) {
  const clean = value.replace(/https?:\/\/\S+/g, "").trim();
  if (!clean) return "Leia a publicação original para conhecer os detalhes.";
  const clipped = clean.length > 360 ? `${clean.slice(0, 357).replace(/\s+\S*$/, "")}…` : clean;
  return clipped;
}

async function fetchSource(source) {
  const response = await fetch(source.url, {
    headers: { "user-agent": "lucasritterdias.com.br/news-radar" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return parseFeed(await response.text(), source.name);
}

async function main() {
  const date = String(args.get("date") || saoPauloDate());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Use --date=AAAA-MM-DD");

  const destination = path.join(OUTPUT_DIR, `news-${date}.md`);
  if (!args.has("dry-run")) {
    try {
      await fs.access(destination);
      console.log(`News de ${date} já existe; nada a fazer.`);
      return;
    } catch {
      // Expected: this date has not been published yet.
    }
  }

  const sources = JSON.parse(await fs.readFile(SOURCES_FILE, "utf8"));
  const results = await Promise.allSettled(sources.map(fetchSource));
  const failures = results
    .map((result, index) => (result.status === "rejected" ? `${sources[index].name}: ${result.reason.message}` : null))
    .filter(Boolean);
  if (failures.length) console.warn(`Feeds indisponíveis:\n- ${failures.join("\n- ")}`);

  const cutoff = new Date(`${date}T21:00:00-03:00`).getTime() - LOOKBACK_HOURS * 60 * 60 * 1000;
  const candidates = results
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .filter((item) => item.title && item.url && !Number.isNaN(item.publishedAt.getTime()))
    .filter((item) => item.publishedAt.getTime() >= cutoff)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  const seen = new Set();
  const perSource = new Map();
  const selected = [];
  for (const item of candidates) {
    const key = normalizeTitle(item.title);
    const count = perSource.get(item.source) ?? 0;
    if (seen.has(key) || count >= 2) continue;
    seen.add(key);
    perSource.set(item.source, count + 1);
    selected.push(item);
    if (selected.length === LIMIT) break;
  }

  if (selected.length < 3) {
    throw new Error(`Apenas ${selected.length} notícias recentes encontradas; publicação cancelada.`);
  }

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(`${date}T12:00:00-03:00`));

  const stories = selected
    .map(
      (item) => `### [${markdownLinkText(item.title)}](${item.url})\n\n**${item.source}**\n\n${shortSummary(item.summary)}`,
    )
    .join("\n\n");

  const content = `---
slug: news-${date}
type: news
category: News
tags: [news, tecnologia]
date: ${date}
word: NEWS
title: ${yamlString(`News — ${formattedDate}`)}
excerpt: ${yamlString("Um radar direto das principais novidades publicadas por fontes de tecnologia nas últimas horas.")}
---

## O radar de hoje

Esta edição reúne publicações recentes de fontes acompanhadas pelo radar. Os resumos abaixo são fornecidos pelos próprios feeds; os links levam ao conteúdo original.

${stories}

## Sobre esta edição

O **News** é gerado automaticamente, sem inteligência artificial e sem custo de API. A seleção considera recência, evita títulos duplicados e limita a presença de uma mesma fonte. A curadoria automática pode deixar passar contexto; confirme informações importantes na publicação original.
`;

  if (args.has("dry-run")) {
    console.log(content);
    return;
  }

  await fs.writeFile(destination, content, { flag: "wx" });
  console.log(`Criado: ${path.relative(ROOT, destination)} (${selected.length} notícias)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

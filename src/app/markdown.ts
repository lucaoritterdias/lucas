import "server-only";
import fs from "node:fs";
import path from "node:path";
import { Marked, type Tokens } from "marked";
import { createCssVariablesTheme, createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import markdown from "shiki/langs/markdown.mjs";
import sql from "shiki/langs/sql.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import yaml from "shiki/langs/yaml.mjs";

/* token colours live in globals.css (--code-*), so code follows the site theme */
const theme = createCssVariablesTheme({ name: "ink", variablePrefix: "--code-" });

const highlighter = createHighlighterCoreSync({
  themes: [theme],
  langs: [bash, javascript, json, markdown, sql, tsx, typescript, yaml],
  engine: createJavaScriptRegexEngine(),
});

const LANG_LABELS: Record<string, string> = {
  bash: "bash",
  sh: "bash",
  shell: "bash",
  js: "js",
  javascript: "js",
  json: "json",
  md: "markdown",
  markdown: "markdown",
  sql: "sql",
  ts: "ts",
  typescript: "ts",
  tsx: "tsx",
  yaml: "yaml",
  yml: "yaml",
};

const CALLOUTS = {
  pt: { NOTE: "Nota", TIP: "Na prática", WARNING: "Atenção" },
  en: { NOTE: "Note", TIP: "In practice", WARNING: "Watch out" },
} as const;

type Locale = keyof typeof CALLOUTS;

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** "{2,5-7}" → Set {2, 5, 6, 7} */
function parseLineRanges(spec: string | undefined) {
  const lines = new Set<number>();
  for (const part of spec?.split(",") ?? []) {
    const [from, to = from] = part.split("-").map(Number);
    for (let line = from; line <= to; line++) lines.add(line);
  }
  return lines;
}

/**
 * Info string: ```ts title="lib/queue.ts" {3,8-10}
 * — language, optional file name for the caption bar, optional lines to mark.
 */
function renderCode(text: string, info = "") {
  const lang = info.match(/^\S*/)?.[0].toLowerCase() ?? "";
  const title = info.match(/title="([^"]+)"/)?.[1];
  const marked = parseLineRanges(info.match(/\{([\d,\s-]+)\}/)?.[1]?.replace(/\s/g, ""));
  const known = lang in LANG_LABELS;

  const html = highlighter.codeToHtml(text, {
    lang: known ? lang : "text",
    theme: "ink",
    transformers: [
      {
        line(node, line) {
          if (marked.has(line)) this.addClassToHast(node, "line-marked");
        },
      },
    ],
  });

  const label = known ? LANG_LABELS[lang] : lang;
  const bar =
    title || label
      ? `<figcaption class="code-bar"><span>${escapeHtml(title ?? "")}</span><span>${escapeHtml(label)}</span></figcaption>`
      : "";
  return `<figure class="code">${bar}${html}</figure>\n`;
}

/**
 * ![alt](figures/name.svg "caption") on its own line — the SVG is inlined so it can
 * use currentColor and the theme tokens, and the title becomes the caption.
 */
function renderFigure(image: Tokens.Image, dir: string) {
  const file = path.join(dir, image.href);
  const svg = fs
    .readFileSync(file, "utf8")
    .replace(/<\?xml[^>]*>\s*/, "")
    .replace(/<svg\b/, `<svg role="img" aria-label="${escapeHtml(image.text)}"`);
  const caption = image.title ? `<figcaption>${image.title}</figcaption>` : "";
  return `<figure class="figure">${svg}${caption}</figure>\n`;
}

/** One Marked instance per locale and content directory: callout labels and figure paths differ. */
export function createMarkdown(locale: Locale, dir: string) {
  const labels = CALLOUTS[locale];

  return new Marked({
    gfm: true,
    renderer: {
      code({ text, lang }) {
        return renderCode(text, lang);
      },

      paragraph({ tokens }) {
        const [only] = tokens;
        if (tokens.length === 1 && only.type === "image" && only.href.endsWith(".svg")) {
          return renderFigure(only as Tokens.Image, dir);
        }
        return false;
      },

      /* > [!NOTE] Optional title — GitHub-style callouts */
      blockquote({ tokens }) {
        const body = this.parser.parse(tokens);
        const match = body.match(/^<p>\[!(NOTE|TIP|WARNING)\][ \t]*([^\n<]*)\n?/);
        if (!match) return false;

        const [whole, type, custom] = match;
        const title = custom.trim() || labels[type as keyof typeof labels];
        const rest = body.slice(whole.length);
        /* the marker either filled its own paragraph or opened the first one */
        const content = rest.startsWith("</p>") ? rest.replace(/^<\/p>\n?/, "") : `<p>${rest}`;
        return `<aside class="callout callout-${type.toLowerCase()}"><p class="callout-title">${escapeHtml(title)}</p>${content}</aside>\n`;
      },
    },
    hooks: {
      /* wide tables scroll inside their own box, never the page */
      postprocess(html) {
        return html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, "</table></div>");
      },
    },
  });
}

/** ~200 wpm over prose and code alike; code reads slower, but is skimmed more. */
export function readingTime(markdownText: string) {
  const words = markdownText
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
  return `${Math.max(1, Math.round(words / 200))} min`;
}

import { ARTICLES, EN_ARTICLES } from "../articles";
import { PROFILE, SITE_URL as SITE } from "../data";

export const dynamic = "force-static";

/** https://llmstxt.org — a Markdown map of the site for language models. */
export function GET() {
  const articles = ARTICLES.map(
    (article) => `- [${article.title}](${SITE}/artigos/${article.slug}): ${article.excerpt} (${article.category}, ${article.date})`
  ).join("\n");

  const englishArticles = EN_ARTICLES.map(
    (article) => `- [${article.title}](${SITE}/en/articles/${article.slug}): ${article.excerpt}`
  ).join("\n");

  const body = `# Lucas Ritter Dias

> Lucas Ritter Dias é empreendedor e engenheiro de software brasileiro, CTO e sócio da Polvor e cofundador do Gestor de Agências. Neste site ele publica notas pessoais sobre software, tecnologia e IA.

O site é em português, com versão em inglês em ${SITE}/en. Lucas começou a programar por volta dos 14 anos, seguiu para o desenvolvimento web e já entregou mais de 100 projetos para empresas de diferentes segmentos e tamanhos. É formado em Análise e Desenvolvimento de Sistemas pela Unisinos, de São Leopoldo.

## Páginas

- [Início](${SITE}/): perfil, projetos ativos e artigos recentes
- [Artigos](${SITE}/artigos): todas as notas pessoais
- [Contato](${SITE}/contato): WhatsApp, e-mail, GitHub e Instagram

## Artigos

${articles}

## Projetos

- [Polvor](https://www.polvor.com): software house que desenvolve produtos digitais e sistemas sob medida; Lucas é CTO e sócio
- [Gestor de Agências](https://www.gestordeagencias.com): plataforma de gestão para agências (clientes, projetos, entregas e financeiro); Lucas é cofundador

## Contato

- E-mail: ${PROFILE.email}
- [GitHub](${PROFILE.github})
- [Instagram](${PROFILE.instagram})

## Optional

- [Feed RSS](${SITE}/feed.xml)
- [Versão em inglês](${SITE}/en)
${englishArticles}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

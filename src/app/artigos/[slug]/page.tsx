import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES } from "../../articles";
import { Header } from "../../components/Header";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTICLES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find((item) => item.slug === slug);
  if (!article) return {};
  return { title: `${article.title} · Lucas Ritter Dias`, description: article.excerpt };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = ARTICLES.find((item) => item.slug === slug);
  if (!article) notFound();

  return <><Header /><main className="route-page single-article-page"><Link className="article-route-back" href="/artigos">← Todos os artigos</Link><article className="route-article"><header><p>{article.category} · {article.date} · {article.time} de leitura</p><h2>{article.title}</h2><strong>{article.excerpt}</strong></header><div>{article.sections.map(({ title, html }) => <section key={title}><h3>{title}</h3><div dangerouslySetInnerHTML={{ __html: html }} /></section>)}<footer className="article-signature"><span>LRD</span><p>Lucas Ritter Dias<br /><small>CTO e sócio da Polvor</small></p></footer></div></article></main></>;
}

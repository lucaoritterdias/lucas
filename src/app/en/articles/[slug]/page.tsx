import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EN_ARTICLES } from "../../../articles";
import { Header } from "../../../components/Header";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return EN_ARTICLES.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const a = EN_ARTICLES.find(i => i.slug === slug); return a ? { title: `${a.title} · Lucas Ritter Dias`, description: a.excerpt } : {}; }
export default async function ArticlePage({ params }: Props) { const { slug } = await params; const a = EN_ARTICLES.find(i => i.slug === slug); if (!a) notFound(); return <><Header /><main className="route-page single-article-page"><Link className="article-route-back" href="/en/articles">← All articles</Link><article className="route-article"><header><p>{a.category} · {a.date} · {a.time} read</p><h2>{a.title}</h2><strong>{a.excerpt}</strong></header><div>{a.sections.map(({ title, html }) => <section key={title}><h3>{title}</h3><div dangerouslySetInnerHTML={{ __html: html }} /></section>)}<footer className="article-signature"><span>LRD</span><p>Lucas Ritter Dias<br/><small>CTO and partner at Polvor</small></p></footer></div></article></main></>; }

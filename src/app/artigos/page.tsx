import Link from "next/link";
import { Header } from "../components/Header";
import { ARTICLES } from "../articles";

export const metadata = { title: "Artigos · Lucas Ritter Dias" };

export default function ArtigosPage() {
  return <><Header /><main className="route-page articles-index-page"><header className="route-hero"><p>Caderno de ideias</p><h1>O que aprendo<br /><em>enquanto construo.</em></h1><span>Reflexões sobre produto, tecnologia e negócio a partir de projetos reais.</span></header><section className="route-article-index">{ARTICLES.map(article => <Link href={`/artigos/${article.slug}`} key={article.slug}><small>{article.number} · {article.category} · {article.time}</small><strong>{article.title}</strong><span>↗</span></Link>)}</section></main></>;
}

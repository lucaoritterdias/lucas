import Link from "next/link";
import { EN_ARTICLES } from "../../articles";
import { Header } from "../../components/Header";
export const metadata = { title: "Articles · Lucas Ritter Dias" };
export default function ArticlesPage() { return <><Header /><main className="route-page articles-index-page"><header className="route-hero"><p>Notebook of ideas</p><h1>What I learn<br /><em>while I build.</em></h1><span>Thoughts on product, technology, and business drawn from real projects.</span></header><section className="route-article-index">{EN_ARTICLES.map(a => <Link href={`/en/articles/${a.slug}`} key={a.slug}><small>{a.number} · {a.category} · {a.time}</small><strong>{a.title}</strong><span>↗</span></Link>)}</section></main></>; }

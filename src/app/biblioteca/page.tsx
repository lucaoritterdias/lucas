import Link from "next/link";
import { Header } from "../components/Header";
import { getBooks } from "../library";

export const metadata = { title: "Biblioteca · Lucas Ritter Dias", description: "Livros, ideias e anotações de leitura de Lucas Ritter Dias." };

export default function LibraryPage() {
  const books = getBooks();
  return <><Header /><main className="route-page library-page"><header className="route-hero"><p>Biblioteca pessoal</p><h1>Livros que li.<br /><em>Ideias que ficaram.</em></h1><span>Uma coleção de anotações, aprendizados e reflexões depois da última página.</span></header>{books.length ? <section className="book-grid">{books.map((book, index) => <Link className="book-card" href={`/biblioteca/${book.slug}`} key={book.slug}><div className="book-cover" style={book.cover ? { backgroundImage: `url(${book.cover})` } : undefined}><span>{String(index + 1).padStart(2, "0")}</span><strong>{book.title}</strong><small>{book.author}</small></div><p>{book.readAt || "Leitura concluída"}</p><h2>{book.title}</h2><span>{book.excerpt}</span></Link>)}</section> : <section className="library-empty"><span>01</span><div><h2>A estante está pronta.</h2><p>Adicione seu primeiro resumo em <code>src/content/library</code>. Use o arquivo <code>_modelo.md</code> como ponto de partida.</p></div></section>}</main></>;
}

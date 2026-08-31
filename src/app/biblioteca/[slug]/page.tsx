import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "../../components/Header";
import { Markdown } from "../../components/Markdown";
import { getBook, getBooks } from "../../library";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return getBooks().map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const book = getBook((await params).slug); return book ? { title: `${book.title} · Biblioteca`, description: book.excerpt } : {}; }
export default async function BookPage({ params }: Props) { const book = getBook((await params).slug); if (!book) notFound(); return <><Header /><main className="route-page book-page"><Link className="article-route-back" href="/biblioteca">← Toda a biblioteca</Link><article className="book-reading"><aside><div className="book-cover book-cover-large" style={book.cover ? { backgroundImage: `url(${book.cover})` } : undefined}><strong>{book.title}</strong><small>{book.author}</small></div><p>{book.rating && <span>{book.rating}</span>}{book.readAt}</p></aside><div><header><p>{book.author} · {book.readAt}</p><h1>{book.title}</h1><strong>{book.excerpt}</strong></header><Markdown source={book.content} /></div></article></main></>; }

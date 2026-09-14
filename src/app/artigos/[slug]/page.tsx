import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ARTICLES } from "../../articles";
import { ArticleView } from "../../components/ArticlePages";

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

  return <ArticleView article={article} locale="pt" />;
}

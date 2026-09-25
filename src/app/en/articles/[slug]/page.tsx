import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EN_ARTICLES } from "../../../articles";
import { ArticleView } from "../../../components/ArticlePages";
import { StructuredData } from "../../../components/StructuredData";
import { SITE_URL } from "../../../data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return EN_ARTICLES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = EN_ARTICLES.find((item) => item.slug === slug);
  if (!article) return {};
  return { title: `${article.title} · Lucas Ritter Dias`, description: article.excerpt };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = EN_ARTICLES.find((item) => item.slug === slug);
  if (!article) notFound();

  const url = `${SITE_URL}/en/articles/${article.slug}`;
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title,
          description: article.excerpt,
          datePublished: article.isoDate,
          dateModified: article.isoDate,
          inLanguage: "en",
          keywords: article.tags,
          url,
          mainEntityOfPage: url,
          author: { "@id": `${SITE_URL}/#person` },
          publisher: { "@id": `${SITE_URL}/#person` },
        }}
      />
      <ArticleView article={article} locale="en" />
    </>
  );
}

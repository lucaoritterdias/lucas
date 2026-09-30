import { ARTICLES } from "../articles";
import { ArticleIndex } from "../components/ArticlePages";

export const metadata = { title: "Artigos · Lucas Ritter Dias" };

export default async function ArtigosPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  return <ArticleIndex articles={ARTICLES} locale="pt" selectedCategory={category} />;
}

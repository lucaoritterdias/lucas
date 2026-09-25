import { ARTICLES } from "../articles";
import { ArticleIndex } from "../components/ArticlePages";

export const metadata = { title: "Artigos · Lucas Ritter Dias" };

export default async function ArtigosPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams;
  return <ArticleIndex articles={ARTICLES} locale="pt" selectedTag={tag} />;
}

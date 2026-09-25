import { EN_ARTICLES } from "../../articles";
import { ArticleIndex } from "../../components/ArticlePages";

export const metadata = { title: "Articles · Lucas Ritter Dias" };

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams;
  return <ArticleIndex articles={EN_ARTICLES} locale="en" selectedTag={tag} />;
}

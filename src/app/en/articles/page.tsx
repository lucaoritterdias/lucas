import { EN_ARTICLES } from "../../articles";
import { readArticleFilters } from "../../components/ArticleList";
import { ArticleIndex } from "../../components/ArticlePages";

export const metadata = { title: "Articles · Lucas Ritter Dias" };

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <ArticleIndex articles={EN_ARTICLES} locale="en" filters={readArticleFilters(await searchParams)} />;
}

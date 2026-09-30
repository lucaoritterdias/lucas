import { ARTICLES } from "../articles";
import { readArticleFilters } from "../components/ArticleList";
import { ArticleIndex } from "../components/ArticlePages";

export const metadata = { title: "Artigos · Lucas Ritter Dias" };

export default async function ArtigosPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <ArticleIndex articles={ARTICLES} locale="pt" filters={readArticleFilters(await searchParams)} />;
}

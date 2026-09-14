import { ARTICLES } from "../articles";
import { ArticleIndex } from "../components/ArticlePages";

export const metadata = { title: "Artigos · Lucas Ritter Dias" };

export default function ArtigosPage() {
  return <ArticleIndex articles={ARTICLES} locale="pt" />;
}

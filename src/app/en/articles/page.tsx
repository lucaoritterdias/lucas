import { EN_ARTICLES } from "../../articles";
import { ArticleIndex } from "../../components/ArticlePages";

export const metadata = { title: "Articles · Lucas Ritter Dias" };

export default function ArticlesPage() {
  return <ArticleIndex articles={EN_ARTICLES} locale="en" />;
}

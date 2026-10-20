import { Library } from "../components/desk/Library";

export const metadata = {
  title: "Biblioteca · Lucas Ritter Dias",
  description: "Os livros na mesa de Lucas Ritter Dias: filosofia, psicologia, software e negócios.",
  alternates: { canonical: "/biblioteca", languages: { "pt-BR": "/biblioteca", en: "/en/library" } },
};

export default function LibraryPage() {
  return <Library locale="pt" />;
}

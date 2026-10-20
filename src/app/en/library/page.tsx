import { Library } from "../../components/desk/Library";

export const metadata = {
  title: "Library · Lucas Ritter Dias",
  description: "The books on Lucas Ritter Dias's desk: philosophy, psychology, software and business.",
  alternates: { canonical: "/en/library", languages: { "pt-BR": "/biblioteca", en: "/en/library" } },
};

export default function EnglishLibraryPage() {
  return <Library locale="en" />;
}

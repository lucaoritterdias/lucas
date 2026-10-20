import { Setup } from "../components/desk/Setup";

export const metadata = {
  title: "Setup · Lucas Ritter Dias",
  description: "O setup de Lucas Ritter Dias: um PC e um notebook com Debian, ligados num monitor LG ultrawide de 34 polegadas.",
  alternates: { canonical: "/setup", languages: { "pt-BR": "/setup", en: "/en/setup" } },
};

export default function SetupPage() {
  return <Setup locale="pt" />;
}

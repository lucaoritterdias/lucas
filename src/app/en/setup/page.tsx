import { Setup } from "../../components/desk/Setup";

export const metadata = {
  title: "Setup · Lucas Ritter Dias",
  description: "Lucas Ritter Dias's setup: a desktop PC and a laptop running Debian, both plugged into a 34-inch LG ultrawide.",
  alternates: { canonical: "/en/setup", languages: { "pt-BR": "/setup", en: "/en/setup" } },
};

export default function EnglishSetupPage() {
  return <Setup locale="en" />;
}

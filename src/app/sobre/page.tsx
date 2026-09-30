import { BioPage } from "../components/BioPage";

export const metadata = {
  title: "Sobre · Lucas Ritter Dias",
  description: "Biografia de Lucas Ritter Dias: engenheiro de software, CTO e sócio da Polvor e cofundador do Gestor de Agências.",
};

export default function SobrePage() {
  return <BioPage locale="pt" />;
}

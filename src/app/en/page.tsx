import { Desk } from "../components/desk/Desk";

export const metadata = {
  title: "Lucas Ritter Dias · Product Engineer",
  description: "Lucas Ritter Dias is a product engineer, CTO and partner at Polvor: he shapes the business, designs the product and builds the software.",
  alternates: { canonical: "/en", languages: { "pt-BR": "/", en: "/en" } },
};

// the receipt carries this year's GitHub contributions; refresh without rebuilding
export const revalidate = 21600;

export default function EnglishHome() {
  return <Desk locale="en" />;
}

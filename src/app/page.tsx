import { Desk } from "./components/desk/Desk";

// the receipt carries this year's GitHub contributions; refresh without rebuilding
export const revalidate = 21600;

export default function Home() {
  return <Desk locale="pt" />;
}

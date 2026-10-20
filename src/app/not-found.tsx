import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="not-found-code">404</p>
      <h1>Essa folha caiu da mesa.</h1>
      <p>O endereço não existe mais. A mesa toda está na página inicial.</p>
      <Link href="/">Voltar para a mesa →</Link>
    </main>
  );
}

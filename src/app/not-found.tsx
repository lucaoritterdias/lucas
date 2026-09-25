import Link from "next/link";

export default function NotFound() {
  return (
    <main className="home not-found">
      <section className="home-intro">
        <p className="not-found-code">404</p>
        <h1>Página não encontrada.</h1>
        <p>O endereço pode ter mudado ou não existe.</p>
      </section>
      <nav className="not-found-links" aria-label="Continuar navegando">
        <Link href="/">Home</Link>
        <Link href="/artigos">Artigos</Link>
        <Link href="/projetos">Projetos</Link>
      </nav>
    </main>
  );
}

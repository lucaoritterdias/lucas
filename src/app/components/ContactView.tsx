import { PROFILE } from "../data";

export function ContactView({ locale }: { locale: "pt" | "en" }) {
  const en = locale === "en";
  const channels = [
    { kicker: en ? "01 / Fastest reply" : "01 / Resposta mais rápida", name: "WhatsApp", detail: PROFILE.phonePretty, href: PROFILE.whatsapp },
    { kicker: en ? "02 / New projects" : "02 / Novos projetos", name: "E-mail", detail: PROFILE.email, href: `mailto:${PROFILE.email}` },
    { kicker: en ? "03 / Code" : "03 / Código", name: "GitHub", detail: PROFILE.githubUser, href: PROFILE.github },
    { kicker: en ? "04 / Follow along" : "04 / Acompanhe", name: "Instagram", detail: PROFILE.instagramUser, href: PROFILE.instagram },
  ];

  return (
    <main>
      <header className="page-head">
        <p className="eyebrow">{en ? "Contact" : "Contato"}</p>
        <h1 className="page-title">{en ? "Talk to me." : "Fale comigo."}</h1>
        <p className="page-lead">
          {en
            ? "To share an idea, ask a question, or just say hi. I reply whenever I can."
            : "Para trocar uma ideia, tirar uma dúvida ou só dizer oi. Respondo sempre que posso."}
        </p>
      </header>
      <section className="page-rows">
        <ul className="rows">
          {channels.map((channel) => (
            <li key={channel.name}>
              <a
                className="row-link"
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
              >
                <span className="row-kicker">{channel.kicker}</span>
                <span className="row-name">{channel.name}</span>
                <span className="row-description">{channel.detail}</span>
                <span className="arrow" aria-hidden>→</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

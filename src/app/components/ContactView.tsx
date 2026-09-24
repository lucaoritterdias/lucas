import { PROFILE } from "../data";

export function ContactView({ locale }: { locale: "pt" | "en" }) {
  const en = locale === "en";
  const channels = [
    { name: "WhatsApp", href: PROFILE.whatsapp },
    { name: "E-mail", href: `mailto:${PROFILE.email}` },
    { name: "GitHub", href: PROFILE.github },
    { name: "Instagram", href: PROFILE.instagram },
  ];

  return (
    <main className="home">
      <header className="home-intro">
        <h1>{en ? "Talk to me." : "Fale comigo."}</h1>
        <p>
          {en
            ? "To share an idea, ask a question, or just say hi. I reply whenever I can."
            : "Para trocar uma ideia, tirar uma dúvida ou só dizer oi. Respondo sempre que posso."}
        </p>
      </header>
      <section className="home-articles contact-links" aria-label={en ? "Contact channels" : "Canais de contato"}>
        <ul>
          {channels.map((channel) => (
            <li key={channel.name}>
              <a
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {channel.name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
